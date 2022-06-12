///////////////////////////////////////////////////
//
// CIS 549       PROJECT #4
//
//
//
//
//////////////////////////////////////////////////

// Default
#include <iostream>
#include <fstream>
#include <string>
#include <cassert>
#include <list>
#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/internet-module.h"
#include "ns3/mobility-module.h"
#include "ns3/applications-module.h"
#include "ns3/config-store-module.h"
#include "ns3/point-to-point-module.h"
#include "ns3/ipv4-address.h"
// NetAnim
#include "ns3/netanim-module.h"
// WiFi
#include "ns3/wave-mac-helper.h"
#include "ns3/ocb-wifi-mac.h"
#include "ns3/yans-wifi-helper.h"
#include "ns3/wifi-80211p-helper.h"
#include "ns3/wifi-module.h"
// LTE
#include "ns3/point-to-point-helper.h"
#include "ns3/lte-helper.h"
#include "ns3/epc-helper.h"
#include "ns3/lte-module.h"
// Flow
#include "ns3/flow-monitor-helper.h"
#include "ns3/flow-monitor-module.h"
#include "ns3/socket.h"
#include "ns3/trace-helper.h"
#include "ns3/packet.h"
#include "ns3/virtual-net-device.h"

#define SIMULATION_TIME_FORMAT(s) Seconds(s)
#define THROUGHPUT_MEASUREMENT_INTERVAL_MS 100.0 // 100 ms measurment interval

#define TCP_TEST 1
#define UDP_TEST 2

#define WIFI 1
#define LTE 2
#define AGGREGATE 3

using namespace ns3;
using namespace std;

NS_LOG_COMPONENT_DEFINE("V2vExample");

bool UplinkEnabled = false;
std::string prefix_file_name = "scratch/MPIP_Tracing"; // Change here
int Scenario = LTE;
uint16_t numberUE = 1;

// node image resource id
uint32_t serverImgId, routerImgId, pgwImgId, enbImgId, wifiapImgId, ueImgId;

// Parameters for Uniform distribution [0,1]
double randomMin = 0;
double randomMax = 1.0;
Ptr<UniformRandomVariable> randomUniform = CreateObject<UniformRandomVariable>();

double lteSent = 0.0;
int totalPacketSent = 0;
double wifiSent = 0.0;

int in_order_timeout = 100; // milliseconds TODO: check if moving to this scope is ok

std::string aggPath = "wifiOnly"; // Three options are available: wifiOnly, lteOnly, and lteAndWifi



///These vectors are for holding on to delay time sent through lte and wifi
std::vector<double> packetDelayTimesWifi;
std::vector<double> packetDelayTimesLte;


uint32_t bytesRcvFromLteUE = 0;
uint32_t bytesRcvFromWifiUE = 0;
uint32_t bytesRcvFromLteRT = 0;
uint32_t bytesRcvFromWifiRT = 0;
double prob_lte_DL_tunnel_optimal = 0.5; /// default： lte and wifi DL will be open first arbitratutly
std::vector<double> packetDelayTimesWifiHistory;
std::vector<double> packetDelayTimesLteHistory;


//---------------------------------------Tag------------------------------------//
// 1. The MyTag class is used to mark the packet go through an IP tunnel  //
// 2. Note that we intentionally let the packet tag be 4 bytes long         //
//    which is also the length of TCP sequence number                       //
//    For this reason, GetSerializedSize is 4 byte long                     //
//    m_simpleValue is uint32_t                                             //
// 3. The way to set up the value is using SetSimpleValue (value)           //
//    Then, using packet->AddByteTag (tag) to attach the tag to the packet  //
// 4. The way to get the vale is using GetSimpleValue ()                    //
//    Then, using packet->FindFirstMatchingByteTag (tag) to get the tag     //
// 5. The reason we use ByteTag is as follows.                              //
//    (1) Because packetTag will be killed in RLC in LTE module             //
//    (2) The length of ByteTag will be included in packet                  //
//        The overhead of using ByteTag can be presented                    //
class MyTag : public Tag
{
public:
    static TypeId GetTypeId(void);
    virtual TypeId GetInstanceTypeId(void) const;
    virtual uint32_t GetSerializedSize(void) const;
    virtual void Serialize(TagBuffer i) const;
    virtual void Deserialize(TagBuffer i);
    virtual void Print(std::ostream &os) const;
    MyTag() { m_simpleValue = 0; }

    void SetSimpleValue(uint32_t value);
    uint32_t GetSimpleValue(void) const;

private:
    uint32_t m_simpleValue;
};
TypeId
MyTag::GetTypeId(void)
{
    static TypeId tid = TypeId("ns3::MyTag")
                            .SetParent<Tag>()
                            .AddConstructor<MyTag>()
                            .AddAttribute("SimpleValue",
                                          "A simple value",
                                          EmptyAttributeValue(),
                                          MakeUintegerAccessor(&MyTag::GetSimpleValue),
                                          MakeUintegerChecker<uint32_t>());
    return tid;
}
TypeId
MyTag::GetInstanceTypeId(void) const
{
    return GetTypeId();
}
uint32_t
MyTag::GetSerializedSize(void) const
{
    return 4;
}
void MyTag::Serialize(TagBuffer i) const
{
    i.WriteU32(m_simpleValue);
}
void MyTag::Deserialize(TagBuffer i)
{
    m_simpleValue = i.ReadU32();
}
void MyTag::Print(std::ostream &os) const
{
    os << "tag#=" << (uint32_t)m_simpleValue << std::endl;
}
void MyTag::SetSimpleValue(uint32_t value)
{
    m_simpleValue = value;
}
uint32_t
MyTag::GetSimpleValue(void) const
{
    return m_simpleValue;
}
//-----------------------------------------Tag----------------------------------//
// 1. The TimeTag class is used to mark the packet go through an IP tunnel//
//    We put the time stamp when we transmit it to record the delay         //
// 2. Note that we intentionally let the packet tag be 4 bytes long         //
//    which is also the length of TCP sequence number                       //
//    For this reason, GetSerializedSize is 4 byte long                     //
//    m_simpleValue is uint32_t                                             //
// 3. The way to set up the value is using SetSimpleValue (value)           //
//    Then, using packet->AddByteTag (tag) to attach the tag to the packet  //
// 4. The way to get the vale is using GetSimpleValue ()                    //
//    Then, using packet->FindFirstMatchingByteTag (tag) to get the tag     //
// 5. The reason we use ByteTag is as follows.                              //
//    (1) Because packetTag will be killed in RLC in LTE module             //
//    (2) The length of ByteTag will be included in packet                  //
//        The overhead of using ByteTag can be presented                    //
class TimeTag : public Tag
{
public:
    static TypeId GetTypeId(void);
    virtual TypeId GetInstanceTypeId(void) const;
    virtual uint32_t GetSerializedSize(void) const;
    virtual void Serialize(TagBuffer i) const;
    virtual void Deserialize(TagBuffer i);
    virtual void Print(std::ostream &os) const;
    TimeTag() { m_simpleValue = 0; }

    void SetSimpleValue(uint32_t value);
    uint32_t GetSimpleValue(void) const;

private:
    uint32_t m_simpleValue;
};
TypeId
TimeTag::GetTypeId(void)
{
    static TypeId tid = TypeId("ns3::TimeTag")
                            .SetParent<Tag>()
                            .AddConstructor<TimeTag>()
                            .AddAttribute("SimpleValue",
                                          "A simple value",
                                          EmptyAttributeValue(),
                                          MakeUintegerAccessor(&TimeTag::GetSimpleValue),
                                          MakeUintegerChecker<uint32_t>());
    return tid;
}
TypeId
TimeTag::GetInstanceTypeId(void) const
{
    return GetTypeId();
}
uint32_t
TimeTag::GetSerializedSize(void) const
{
    return 4;
}
void TimeTag::Serialize(TagBuffer i) const
{
    i.WriteU32(m_simpleValue);
}
void TimeTag::Deserialize(TagBuffer i)
{
    m_simpleValue = i.ReadU32();
}
void TimeTag::Print(std::ostream &os) const
{
    os << "tag#=" << (uint32_t)m_simpleValue << std::endl;
}
void TimeTag::SetSimpleValue(uint32_t value)
{
    m_simpleValue = value;
}
uint32_t
TimeTag::GetSimpleValue(void) const
{
    return m_simpleValue;
}

//------------------------------------Tunneling---------------------------------//
int UsedTunnelPort = 100;
Ptr<OutputStreamWrapper> queuingDelay;
Ptr<OutputStreamWrapper> receivedPacketSequenceNumberUE;
Ptr<OutputStreamWrapper> packetSequenceToUpperLayer;
Ptr<OutputStreamWrapper> prefix_thp_in_lte;
Ptr<OutputStreamWrapper> prefix_thp_in_wifi;
Ptr<OutputStreamWrapper> prefix_dly_in_lte;
Ptr<OutputStreamWrapper> prefix_dly_in_wifi;
Ptr<OutputStreamWrapper> prefix_input_rate_lte;
Ptr<OutputStreamWrapper> prefix_input_rate_wifi;

class Tunnel
{

    int TunnelPort;
    // This MarkedPacket is used in QueueRecv                                   //
    // The reason we use this struct is that we should                          //
    // (1) decide which interface receives this packet, and after reordering    //
    //     , we still need to deliver the packet to the interface (tunnel_number//
    // (2) keep record of the sequence number of the packet before the tunnel   //
    //     , which is important to do reordering (seq_number)                   //
    // (3) keep recored of the entering time of the packet for setting up the   //
    //     the timeout period (enter_time)                                      //
    struct MarkedPacket
    {
        Ptr<Packet> m_packet;
        uint32_t tunnel_number;
        uint32_t seq_number;
        uint32_t enter_time;
    };
    // The way to build an IP tunnel between one node and two interfaces is     //
    // using Socket                                                             //
    // rtSocket is the router socket                                            //
    // msIfc0Socket is the socket of mobile station interface 0                 //
    // msIfc1Socket is the socket of mobile station interface 1                 //
    // {rt, msIfc0, msIfc1}Address is the new IP address for the tunnel         //
    // {rt, msIfc0, msIfc1}Tap is the network device for this new IP address     //
    Ptr<Socket> m_rtSocket;
    Ptr<Socket> m_msIfc0Socket;
    Ptr<Socket> m_msIfc1Socket;
    Ipv4Address m_rt0Address;
    Ipv4Address m_rt1Address;
    Ipv4Address m_msIfc0Address;
    Ipv4Address m_msIfc1Address;
    Ptr<VirtualNetDevice> m_msIfc0Tap;
    Ptr<VirtualNetDevice> m_msIfc1Tap;
    Ptr<VirtualNetDevice> m_rtTap;
    // The following valuables are for reordering                               //
    // packetQueue is used for reordering                                       //
    // packet_number is used to keep the current sequence number we want after  //
    // after tunneling                                                          //
    // counter is used to provide the sequence number before tunneling          //
    Ptr<UniformRandomVariable> m_rng;
    std::list<MarkedPacket> packetQueue;
    int packet_number;
    EventId TimeoutEventId, TimeoutEventId2;
    int timeout_period = 100; // milliseconds
    uint32_t counter;

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    // When Timeout happens, deliver the in-ordering timeout packet to the upper layer from the queue  //
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    void Timeout(uint32_t packet_id)
    {

        //////////////////////////////////////////
        // Cis 549 Project 4    Problem 1
        /////////////////////////////////////////
        ///////////////////////////////////////////////////////////
        // Check the packet sequence number and the waitng time that the packet has been waiting in the queue
        // Decide if it is the one need to be delivered to upper layer
        //
        // When delivering the packet to the upper layer, check the tunnel number where the packet came through
        // Use the following example code to deliver the packet to upper layer
        /////////////////
        // if(packet_temp.tunnel_number==0){
        //       m_msIfc0Tap->Receive (packet_temp.m_packet, 0x0800, m_msIfc0Tap->GetAddress (), m_msIfc0Tap->GetAddress (), NetDevice::PACKET_HOST);
        //    }
        //    else{
        //        m_msIfc1Tap->Receive (packet_temp.m_packet, 0x0800, m_msIfc1Tap->GetAddress (), m_msIfc1Tap->GetAddress (), NetDevice::PACKET_HOST);
        //    }
        //////////////////
        // Deliver all front packets that are in sequence
        // If there was a sequence number gap then create a timeout event if the packet has been waiting less than the timeout
        // Following are the supporting functions you may need to know and use.
        //
        // packetQueue.pop_front();
        // Simulator::Cancel(TimeoutEventId);  // event cancle
        // TimeoutEventId = Simulator::Schedule(MilliSeconds(waiting_time),&Tunnel::Timeout,this,packet_temp.seq_number);
        //
        /////////////////////////////////////////////////////////////
        // EDIT START
        //
        // about 40 lines would work

        // early terminate if timeout for wrong packet. Timeout packet id cannot be smaller than the waiting packet_number
        if ((int)packet_id < packet_number)
            return;

        if (packetQueue.size() != 0)
        {
            while (packetQueue.front().seq_number <= packet_id) // ship all the seq before and matching
            {
                if (packetQueue.size() == 0)
                {
                    break;
                }
                MarkedPacket packet_temp = packetQueue.front();

                //Metric
                *queuingDelay->GetStream() << Simulator::Now().GetSeconds() << " " << Simulator::Now().GetMilliSeconds() - packet_temp.enter_time << std::endl;
                *packetSequenceToUpperLayer->GetStream() << Simulator::Now().GetSeconds() << " " << packet_temp.seq_number << std::endl;

                if (packet_temp.tunnel_number == 0)
                {
                    m_msIfc0Tap->Receive(packet_temp.m_packet, 0x0800, m_msIfc0Tap->GetAddress(), m_msIfc0Tap->GetAddress(), NetDevice::PACKET_HOST);
                }
                else
                {
                    m_msIfc1Tap->Receive(packet_temp.m_packet, 0x0800, m_msIfc1Tap->GetAddress(), m_msIfc1Tap->GetAddress(), NetDevice::PACKET_HOST);
                }
                packetQueue.pop_front(); // remove the packet sent
                if ((int)packetQueue.front().seq_number == packet_number)
                    packet_number++; // increase packet size if seq number equals packet number;
            }

            // update timeout event if there is a gap
            if (packetQueue.size() != 0)
            {
                uint32_t longest_wait = packetQueue.begin()->enter_time;
                uint32_t longest_wait_seq_number = packetQueue.begin()->seq_number;

                for (std::list<MarkedPacket>::iterator it = packetQueue.begin(); it != packetQueue.end(); ++it)
                {
                    // find the packet with longest waiting.
                    if (it->enter_time < longest_wait)
                    {
                        longest_wait = it->enter_time;
                        longest_wait_seq_number = it->seq_number;
                    }
                }

                // get the total time waited then the diff of wait time
                uint32_t total_waited_time = in_order_timeout - ((uint32_t)Simulator::Now().GetMilliSeconds() - longest_wait);
                TimeoutEventId = Simulator::Schedule(MilliSeconds(total_waited_time), &Tunnel::Timeout, this, longest_wait_seq_number);
            }
        }
        // EDIT END
    }

    // There are several procedures in QueueRecv                                //
    // 1. We should mark every packet and store it into the Queue.              //
    // 2. If this is the packet we want now, just send it to the upper layer.   //
    //    (1) After sending this packet to the upper layer, we need to examine  //
    //        our queue right now.                                              //
    //        If it is empty, we do nothing.                                    //
    //        Otherwise, we should see whether or not we can send more packets  //
    //        to the upper layer.                                               //
    //    (2) When there is another gap appearing, we set up the timeout period //
    // 3. If this is not the packet we want now, push back it into the queue    //
    //    and set up the timeout period.                                        //
    // 4. Once the timeout happens, go to Timeout ()                            //
    void QueueRecv(Ptr<Packet> packet, uint32_t tunnel_number)
    {
        MyTag tagCopy;
        packet->FindFirstMatchingByteTag(tagCopy);
        MarkedPacket new_Packet;
        new_Packet.m_packet = packet;
        new_Packet.tunnel_number = tunnel_number;
        new_Packet.enter_time = (uint32_t)Simulator::Now().GetMilliSeconds();
        new_Packet.seq_number = (uint32_t)tagCopy.GetSimpleValue();

        //////////////////////////////////////////
        // Cis 549 Project #4   Problem 1
        /////////////////////////////////////////
        /////////////////////////////////////////
        // If this is the packet sequence number to be delivered to upper layer, then don't need to insert to the queue
        // It can be delivered to uppler layer directly.
        // but you still need to update the statistics you need to collect 
        ////////////////////////////////////////
        // When delivering the packet to the upper layer, check the tunnel number where the packet came through
        // Use folowing code to deliver the packet to upper layer
        ///////////////////
        // if(packet_temp.tunnel_number==0){ //if LTE
        //       m_msIfc0Tap->Receive (packet_temp.m_packet, 0x0800, m_msIfc0Tap->GetAddress (), m_msIfc0Tap->GetAddress (), NetDevice::PACKET_HOST);
        //    }
        //    else{ //if wifi
        //        m_msIfc1Tap->Receive (packet_temp.m_packet, 0x0800, m_msIfc1Tap->GetAddress (), m_msIfc1Tap->GetAddress (), NetDevice::PACKET_HOST);
        //    }
        //////////////////
        // Once a packet is delivered to uppler layer, check the next packets in the queue, if some of them can be delivered as well
        //
        // If there were, then deliver all packets that are in sequence
        // If there is a sequence number gap then create a timeout event if the packet has been waiting less than the timeout ??
        // Following are the supporting functions you may need to know and use.
        //
        // packetQueue.pop_front();
        // Simulator::Cancel(TimeoutEventId);  // event cancle
        // TimeoutEventId = Simulator::Schedule(MilliSeconds(waiting_time),&Tunnel::Timeout,this,packet_temp.seq_number); 
        //
        /////////////////////////////////////////////////////////////
        //
        // If the incoming packet sequence number is not the packet you are waiting for then insert the packet in the queue in-order
        // You may consider using the following functions:
        /////////////
        // packetQueue.size()
        // packetQueue.push_back(new_Packet);
        // packetQueue.end()
        // packetQueue.insert()
        ////////////////////////////////////////////////////////////////

        // EDIT START
        // about 70 lines would work.
        
        //statistics
        *receivedPacketSequenceNumberUE->GetStream() << Simulator::Now().GetSeconds() << " " << new_Packet.seq_number << std::endl;

        // For logging purpose
        //cout << "packet numbers seq  packet " << new_Packet.seq_number << " " << (int) new_Packet.seq_number << " " << packet_number << " " << ((int) new_Packet.seq_number <= packet_number) << std::endl;
        
        // if correct packet sequence number or smaller(came very late)
        if ((int)new_Packet.seq_number <= packet_number)
        {
            // correct packet clear timeout 
            Simulator::Cancel(TimeoutEventId);

            // Metric
            *queuingDelay->GetStream() << Simulator::Now().GetSeconds() << " " << 0 << std::endl;
            *packetSequenceToUpperLayer->GetStream() << Simulator::Now().GetSeconds() << " " << new_Packet.seq_number << std::endl;
            // send it
            if (new_Packet.tunnel_number == 0)
            { // if LTE
                m_msIfc0Tap->Receive(new_Packet.m_packet, 0x0800, m_msIfc0Tap->GetAddress(), m_msIfc0Tap->GetAddress(), NetDevice::PACKET_HOST);
            }
            else
            { // if wifi
                m_msIfc1Tap->Receive(new_Packet.m_packet, 0x0800, m_msIfc1Tap->GetAddress(), m_msIfc1Tap->GetAddress(), NetDevice::PACKET_HOST);
            }

            packet_number++; // increase packet number to next

            // check the queues for matching next packets to be sent up
            while ((int) packetQueue.front().seq_number == packet_number)
            {
                MarkedPacket next_packet = packetQueue.front(); // copy the matching packet
                packetQueue.pop_front();                        // remove the packet

                // metric
                *queuingDelay->GetStream() << Simulator::Now().GetSeconds() << " " << Simulator::Now().GetMilliSeconds() - next_packet.enter_time << std::endl;
                *packetSequenceToUpperLayer->GetStream() << Simulator::Now().GetSeconds() << " " << next_packet.seq_number << std::endl;

                if (next_packet.tunnel_number == 0)
                { // if LTE
                    m_msIfc0Tap->Receive(next_packet.m_packet, 0x0800, m_msIfc0Tap->GetAddress(), m_msIfc0Tap->GetAddress(), NetDevice::PACKET_HOST);
                }
                else
                { // if wifi
                    m_msIfc1Tap->Receive(next_packet.m_packet, 0x0800, m_msIfc1Tap->GetAddress(), m_msIfc1Tap->GetAddress(), NetDevice::PACKET_HOST);
                }
                packet_number++;
            }
            // check if there is gap and reset timeout
            if (packetQueue.size() != 0)
            {
                uint32_t longest_wait = packetQueue.begin()->enter_time;
                uint32_t longest_wait_seq_number = packetQueue.begin()->seq_number;

                for (std::list<MarkedPacket>::iterator it = packetQueue.begin(); it != packetQueue.end(); ++it)
                {
                    // find the packet with longest waiting.
                    if (it->enter_time < longest_wait)
                    {
                        longest_wait = it->enter_time;
                        longest_wait_seq_number = it->seq_number;
                    }
                }

                // get the total time waited then the diff of wait time
                uint32_t total_waited_time = in_order_timeout - ((uint32_t)Simulator::Now().GetMilliSeconds() - longest_wait);
                TimeoutEventId = Simulator::Schedule(MilliSeconds(total_waited_time), &Tunnel::Timeout, this, longest_wait_seq_number);
            }
        }
        else // if not correct packet sequnce number
        {
            // if queue is empty insert to queue and set timeout
            if (packetQueue.size() == 0)
            {
                packetQueue.push_back(new_Packet);
                TimeoutEventId = Simulator::Schedule(MilliSeconds(in_order_timeout), &Tunnel::Timeout, this, new_Packet.seq_number);
            }
            else // if que is not empty insert and sort
            {
                packetQueue.push_back(new_Packet);
                packetQueue.sort([](const MarkedPacket &packet1, const MarkedPacket &packet2)
                                 { return packet1.seq_number < packet2.seq_number; });
            }
        }

        // EDIT END
    }

    bool
    msIfcVirtualSend(Ptr<Packet> packet, const Address &source, const Address &dest, uint16_t protocolNumber)
    {
        // Project #4 does not use UL Tunnel
        // So, skip this function

        NS_LOG_DEBUG("Send to " << m_rt0Address << ": " << *packet);

        if (1)
        { // send UL packet throught LTE path only IF UL tunnel is used
            cout << "UE sent via LTE path" << endl;
            m_msIfc0Socket->SendTo(packet, 0, InetSocketAddress(m_rt0Address, TunnelPort)); // send UL traffic via LTE path
        }
        else
        {
            m_msIfc1Socket->SendTo(packet, 0, InetSocketAddress(m_rt1Address, TunnelPort)); // send UL traffic via Wi-Fi path
        }
        return true;
    }

    bool rtVirtualSend(Ptr<Packet> packet, const Address &source, const Address &dest, uint16_t protocolNumber)
    // DL traffic from a router toward UE                                      //
    // When sending a packet from the sender (router,PGW)                          //
    // We can decide the router for every packet                                //
    {
        MyTag mytag;
        mytag.SetSimpleValue(counter); // add packet sequence number at the router
        packet->AddByteTag(mytag);     // attach the sequence number
        counter++;
        TimeTag timetag;
        timetag.SetSimpleValue(Simulator::Now().GetMilliSeconds()); // add packet sent time at the router
        packet->AddByteTag(timetag);
                                        // attach the transmission time at the router

        if (Scenario == AGGREGATE)
        {
            totalPacketSent++;
           
            // if(!packetDelayTimesWifi.empty()){
            //     cout << "from the vector" << packetDelayTimesWifi.back() << endl;
            // }
            // cout << "the packet size calc from router" << packet->GetSize() << endl;
            // printf ("Preceding with blanks: %d \n", packet->GetSize());
            // printf("\n");
            // TimeoutEventId2 = Simulator::Schedule(MilliSeconds(timeout_period), &Tunnel::calculateOptimalTunnel, this);
            // printf("\n");


                //These 4 vectors are the global variables to access for router algo calculation
               // std::vector<double> packetDelayTimesLte;
               // std::vector<double> packet_throughputs_lte;
               // std::vector<double> packetDelayTimesWifi;
               // std::vector<double> packet_throughputs_wifi;
         
            // Your algorithm should make a decision when to use which path (LTE or WiFi path) intellegiently.
            // The throughput using your algorithm should be higher than the MAX(LTE_path_only_throughput, WiFi_path_only_Throughput)
            // or at least equal to the MAX(LTE_path_only_throughput, WiFi_path_only_Throughput)
            //
            // You must test your algorithm with various combinations of the WiFI MCS, LTE MCS,
            // LTE path network delay, and WiFi path network delay.
            //
           
            if (aggPath.compare("lteOnly") == 0)
            {
                // Test #1 :::: This uses LTE path ONLY for DL traffic
                m_rtSocket->SendTo(packet, 0, InetSocketAddress(m_msIfc0Address, TunnelPort)); // m_msIfc0Address : send to the LTE path
            }
            else if (aggPath.compare("wifiOnly") == 0)
            {
                // OR

                // TEST #2  ::::: This uses Wi-Fi path ONLY for DL traffic
                m_rtSocket->SendTo(packet, 0, InetSocketAddress(m_msIfc1Address, TunnelPort)); // m_msIfc1Address: send to the Wi-Fi path
            }
            else if (aggPath.compare("lteAndWifi") == 0)
            {
                        //////////////////////////////////////////
                        // Cis 549 Project #4   Problem 2
                        /////////////////////////////////////////        
                        /////////////////////////////////////////
                        // Switching between LTE and WiFi based on 
                        // the real-time throughput (bps) and 
                        // the one-way packet delay (ms) measurement at the UE for both LTE and Wi-Fi path, 
                        // and the traffic input bit rate measurement at the router toward LTE and Wi-Fi paths.
                        ////////////////////////////////////////
                Ptr<UniformRandomVariable> x = CreateObject<UniformRandomVariable> ();
                x->SetAttribute ("Min", DoubleValue (0.0));
                x->SetAttribute ("Max", DoubleValue (1.0));

                double value = x->GetValue ();
                
                if (value <= prob_lte_DL_tunnel_optimal) // global variable whose value is changed by timeout function calculateOptimalTunnel below
                {
                    // Use LTE path for DL traffic
                    bytesRcvFromLteRT += packet->GetSize();
                    m_rtSocket->SendTo(packet, 0, InetSocketAddress(m_msIfc0Address, TunnelPort));
                     // cout << " packet sent via lte " << endl;
                    // cout << "LTE path: throughput= " << (bytesRcvFromLte * (double)8 / 1e6) * (1000.0 / THROUGHPUT_MEASUREMENT_INTERVAL_MS) << endl;
                }
                else
                {
                    // use Wi-Fi path DL traffic
                    bytesRcvFromWifiRT += packet->GetSize();
                    m_rtSocket->SendTo(packet, 0, InetSocketAddress(m_msIfc1Address, TunnelPort));
                    // cout << "packet sent via wifi" << endl;
                    // cout << "WiFi path: throughput= " << (bytesRcvFromWifi * (double)8 / 1e6) * (1000.0 / THROUGHPUT_MEASUREMENT_INTERVAL_MS) << endl;
                    
                }

                
            }
            else
            {
                // This should not occur.
                printf("You are using Traffic aggregation scenario, but the aggreagatipn method option is invalid.\n");
                printf("Choose one of these three options using \"--aggPath\" input option: wifiOnly, lteonly, lteAndWifi\n\n");
                exit(1);
            }
        }

        return true;
    }

    ////This function is called every 100ms 
    void calculateOptimalTunnel(){  

        
        Time now = Simulator::Now();    // Return the simulator time
        double lteThroughput = (bytesRcvFromLteUE * (double) 8 / 1e6) * (1000.0 / timeout_period); 
        // cout << now.GetSeconds() << " LTE path: throughput= " << lteThroughput << std::endl;
        double wifiThroughput = (bytesRcvFromWifiUE * (double) 8 / 1e6) * (1000.0 / timeout_period);
        // cout << now.GetSeconds() << " WiFi path: throughput= " << wifiThroughput << std::endl;
        double wifiInputRate = (bytesRcvFromWifiRT * (double) 8 / 1e6) * (1000.0 / timeout_period);
        double lteInputRate = (bytesRcvFromLteRT * (double) 8 / 1e6) * (1000.0 / timeout_period);
        // if(packetDelayTimesLte.empty()){
        //         return; //don't make calculction return dumby value
        //     }

        if(packetDelayTimesWifiHistory.empty() || packetDelayTimesLte.empty()){
             if(wifiInputRate - wifiThroughput  > lteInputRate - lteThroughput){

            prob_lte_DL_tunnel_optimal = 0.8;
            cout << "lte better" << endl;
        }
        else{
            prob_lte_DL_tunnel_optimal = 0.2;
            cout << "wifi better" << endl;
        }


        }
        else{
                 double packetDelayLteAverage = accumulate( packetDelayTimesLte.begin(), packetDelayTimesLte.end(), 0.0/ packetDelayTimesLte.size());
                 cout << " LTE path: Delay= " << packetDelayLteAverage << std::endl;
        
                int packetDelayIdx = 0;
                double packetDelayLteRecentAverage = 0.0;
       if(packetDelayTimesLteHistory.size() > 4){
            packetDelayIdx = packetDelayTimesLteHistory.size() - 4;

       }
       for(unsigned int i = packetDelayIdx; i < packetDelayTimesLteHistory.size(); ++i){
                packetDelayLteRecentAverage += packetDelayTimesLteHistory.at(i);
       }
       if(packetDelayIdx == 0){
        packetDelayLteRecentAverage /= packetDelayTimesLteHistory.size();
       }
       else{
        packetDelayLteRecentAverage /= packetDelayIdx;
       }
       if (packetDelayLteAverage > 2 * packetDelayLteRecentAverage  ){
                    // delay is twice higher than historical average
                    prob_lte_DL_tunnel_optimal = 0.2;
                    cout << " Time to switch to WiFi "<< std::endl;
            }


       double packetDelayWifiAverage = accumulate( packetDelayTimesWifi.begin(), packetDelayTimesWifi.end(), 0.0/ packetDelayTimesWifi.size());
       packetDelayIdx = 0;
       double packetDelayWifiRecentAverage = 0.0;
       if(packetDelayTimesLte.size() > 4){
            packetDelayIdx = packetDelayTimesWifiHistory.size() - 4;

       }
       for(unsigned int i = packetDelayIdx; i < packetDelayTimesWifiHistory.size(); ++i){
                packetDelayWifiRecentAverage += packetDelayTimesWifiHistory.at(i);
       }
       if(packetDelayIdx == 0){
        packetDelayWifiRecentAverage /= packetDelayTimesWifiHistory.size();
       }
       else{
        packetDelayWifiRecentAverage /= packetDelayIdx;
       }
            if(wifiInputRate - wifiThroughput  > lteInputRate - lteThroughput || packetDelayLteAverage < 2 * packetDelayLteRecentAverage ||
                                     packetDelayWifiAverage > 2 * packetDelayWifiRecentAverage){

            prob_lte_DL_tunnel_optimal = 0.8;
            cout << "lte better" << endl;
        }
        else{
            prob_lte_DL_tunnel_optimal = 0.2;
            cout << "wifi better" << endl;
        }

        packetDelayTimesLteHistory.push_back(packetDelayLteAverage);
        packetDelayTimesWifiHistory.push_back(packetDelayWifiAverage);
        }
     
        // can be nan
        // double lteInputDataRate = (bytesRcvFromLteRT * (double) 8 / 1e6) * (1000.0 / timeout_period);
        // double wifiInputDataRate = (bytesRcvFromWifiRT * (double) 8 / 1e6) * (1000.0 / timeout_period);
        // cout << "lte path input rate  = " << lteInputDataRate << std::endl;
        // cout << "wifi path input rate" << wifiInputDataRate << std::endl;

        bytesRcvFromWifiUE = 0;
        bytesRcvFromLteUE = 0;
        // lteInputDataRate = 0;
        // wifiInputDataRate = 0;
        packetDelayTimesWifi.clear();
        packetDelayTimesLte.clear();
        

        
            ///make calculcation with bytes recevied at UE and set back to zero for calculation at next timeout
            // use the delay values from vector, and clear the vector of the next timeout
            // throughput at router side
            // double lteThroughput = (bytesRcvFromLte * (double)8 / 1e6) * (1000.0 / timeout_period); // Convert Application layer total RX Bytes to MBits.
            // // statitics
            // *prefix_input_rate_lte->GetStream() << Simulator::Now().GetSeconds() << " " << lteThroughput << std::endl;
            // *prefix_dly_in_lte->GetStream() << Simulator::Now().GetSeconds() << " " << packetDelayLteAverage << std::endl;
                       
        // // }
        // }
        // else{

           
            
        //     ///wifi is active , uses these global variables to make calculation 
        //     // std::vector<double> packetDelayTimesWifi;
        
        //     ///make calculcation with bytes recevied at UE and set back to zero for calculation at next time out
        //     // double wifiThroughput = (bytesRcvFromWifi * (double)8 / 1e6) * (1000.0 / timeout_period);
        //     // cout << now.GetSeconds() << " WiFi path: throughput= " << wifiThroughput << std::endl;     
            
           
        //     //if(not good enough){
        //         // if current delay is higher than twice of historical number or throughput is too low (UE < Router)
        //     if(std::isnan(packetDelayWifiAverage)){
        //         // no delay information at current packet
        //     } else {
        //         double packetDelayWiFiHistoryAverage = accumulate( packetDelayTimesWifiHistory.begin(), packetDelayTimesWifiHistory.end(), 0.0/ packetDelayTimesWifiHistory.size());
        //         if (packetDelayWifiAverage > 2 * packetDelayWiFiHistoryAverage){
        //             // delay is twice higher than historical average
        //             prob_lte_DL_tunnel_active = 0.8;
        //             cout << " Time to switch to LTE "<< std::endl;
        //         }
        //         packetDelayTimesWifiHistory.push_back(packetDelayWifiAverage);
        //     }
            //}
            // statitics
            // *prefix_input_rate_wifi->GetStream() << Simulator::Now().GetSeconds() << " " << wifiThroughput << std::endl;
            // *prefix_dly_in_wifi->GetStream() << Simulator::Now().GetSeconds() << " " << packetDelayWifiAverage << std::endl;
        // }
        // Simulator::Cancel(TimeoutEventId2);
        // Simulator::Schedule(MilliSeconds(timeout_period), &Tunnel::calculateOptimalTunnel, this);
        TimeoutEventId2 = Simulator::Schedule(MilliSeconds(timeout_period), &Tunnel::calculateOptimalTunnel, this);

    }



    void rtSocketRecv(Ptr<Socket> socket)
    // router receives a packet through UL tunnel : IF UL Tunnel is used
    // Project #4 does not use UL tunnel.
    // So, skip this function
    {
        Ptr<Packet> packet_once = socket->Recv(20, 0); // IP Header Length: 20
        Ipv4Header ipv4Header;
        packet_once->RemoveHeader(ipv4Header);
        Ipv4Address tempDestination = ipv4Header.GetDestination();
        Ptr<Packet> packet = socket->Recv(std::numeric_limits<uint32_t>::max(), 0);
        NS_LOG_DEBUG("rtSocketRecv: " << *packet);

        if (tempDestination == m_rt0Address)
        { // UL packet via LTE path arrived at Router
            cout << "LTE path: UL pkt arrived at Router through a UL tunnel: Time= " << Simulator::Now().GetMilliSeconds() << endl;
        }
        else
        { // UL packet via WiFi path arrived at Router
            cout << "WiFi path: UL pkt arrived at Router through a UL tunnel: Time= " << Simulator::Now().GetMilliSeconds() << endl;
        }
    }

    //////////////////////////////////////////////////////////////////////////////
    // The first line of the receiving procedure is to remove the tunnel header //
    // Then, use the original receiving procedure of socket to receive packet   //
    // After receiving the packet from socket, we send it to the QueueRecv      //
    // for re-ordering                                                           //
    //////////////////////////////////////////////////////////////////////////////

    void msIfc0SocketRecv(Ptr<Socket> socket)
    {
        // UE recveives a packet via LTE tunnel interface

        //////////////////////////////////////////
        // Cis 549 Project #4   Problem 2
        ///////////////////////////////////////// 

        Ptr<Packet> packet_once = socket->Recv(20, 0); // IP Header Length: 20
        Ipv4Header ipv4Header;
        packet_once->RemoveHeader(ipv4Header);
        Ipv4Address tempDestination = ipv4Header.GetDestination();
        Ptr<Packet> packet = socket->Recv(std::numeric_limits<uint32_t>::max(), 0);
        NS_LOG_DEBUG("msIfc0SocketRecv: " << *packet);

        if (tempDestination == m_msIfc0Address)
        {
            // IP Packet Level Measurement
            TimeTag tagCopy;
            packet->FindFirstMatchingByteTag(tagCopy); // tagCopy contains the packet sent time
            MyTag tagCopy2;
            packet->FindFirstMatchingByteTag(tagCopy2); // tagCopy2 contains the packet sequence number

            bytesRcvFromLteUE += packet->GetSize();
            // UE calculate one-way delay
            packetDelayTimesLte.push_back(Simulator::Now().GetMilliSeconds()-(uint32_t)tagCopy.GetSimpleValue());
            double thpInLte = (bytesRcvFromLteUE * (double)8 / 1e6) * (1000.0 / THROUGHPUT_MEASUREMENT_INTERVAL_MS); 
            *prefix_thp_in_lte->GetStream() << Simulator::Now().GetSeconds() << " " << thpInLte << std::endl;
            
            ///////////////////////////////////////////
            // Example code for you to monitor the incoming packet information
            ////////////////////////////////////////////////////////
            // cout << "UE-DL-LTE: Packet Seq#= " << (uint32_t)tagCopy2.GetSimpleValue() << endl;
            // cout << "One-way delay= " << Simulator::Now().GetMilliSeconds()-(uint32_t)tagCopy.GetSimpleValue() << " ms" << endl;
            ///////////////////////////////////////////

            ////////////////////////////////////////////////////
            // Once you implement QueueRecv() and Timeout() functions, uncomment the line below
            QueueRecv(packet, 0); // Use this line after implementing QueueRecv() and Timeout() functions
            //                  ---  Tihis is the tunnel id. 0 means LTE path and 1 means WiFi path

            // remove this line after implementing QueueRecv() and Timeout() functions
            // The code below directly deliver the packet to upper layer instead of inserting in to the queue
            // m_msIfc0Tap->Receive(packet, 0x0800, m_msIfc0Tap->GetAddress(), m_msIfc0Tap->GetAddress(), NetDevice::PACKET_HOST);
            ////////////////////////////////////////////////////
        }
    }

    void msIfc1SocketRecv(Ptr<Socket> socket)
    {
        // UE recveives a packet via Wi-Fi tunnel interface

        Ptr<Packet> packet_once = socket->Recv(20, 0); // IP Header Length: 20
        Ipv4Header ipv4Header;
        packet_once->RemoveHeader(ipv4Header);
        Ipv4Address tempDestination = ipv4Header.GetDestination();
        Ptr<Packet> packet = socket->Recv(std::numeric_limits<uint32_t>::max(), 0);
        NS_LOG_DEBUG("msIfc1SocketRecv: " << *packet);

        if (tempDestination == m_msIfc1Address)
        {
            // IP Packet Level Measurement
            TimeTag tagCopy;
            packet->FindFirstMatchingByteTag(tagCopy); // tagCopy contains the packet sent time
            MyTag tagCopy2;
            packet->FindFirstMatchingByteTag(tagCopy2); // tagCopy2 contains the packet sequence number


            bytesRcvFromWifiUE += packet->GetSize();
            packetDelayTimesWifi.push_back(Simulator::Now().GetMilliSeconds()-(uint32_t)tagCopy.GetSimpleValue());
            double thpInWifi = (bytesRcvFromWifiUE * (double)8 / 1e6) * (1000.0 / THROUGHPUT_MEASUREMENT_INTERVAL_MS); 
            *prefix_thp_in_wifi->GetStream() << Simulator::Now().GetSeconds() << " " << thpInWifi << std::endl;
             // cout << "This is the size of packet   " << packet->GetSize() << endl;
            ///////////////////////////////////////////
            // Example code for you to monitor the incoming packet information
            ////////////////////////////////////////////////////////
            // cout << "UE-DL-WiFi: Packet Seq#= " << (uint32_t)tagCopy2.GetSimpleValue() << endl;
            // cout << "One-way delay= " << Simulator::Now().GetMilliSeconds()-(uint32_t)tagCopy.GetSimpleValue() << " ms" << endl;
            ///////////////////////////////////////////

            ////////////////////////////////////////////////////
            // Once you implement QueueRecv() and Timeout() functions, uncomment the line below
            QueueRecv(packet, 1); // Use this line after implementing QueueRecv() and Timeout() functions
            //                  ---  Tihis is the tunnel id. 0 means LTE path and 1 means WiFi path

            // remove this line after implementing QueueRecv() and Timeout() functions
            // The code below directly deliver the packet to upper layer instead of inserting in to the queue
            // m_msIfc1Tap->Receive(packet, 0x0800, m_msIfc1Tap->GetAddress(), m_msIfc1Tap->GetAddress(), NetDevice::PACKET_HOST);
            ////////////////////////////////////////////////////
        }
    }

public:
    Tunnel()
    {
        // We first initialize the parameters related to the reordering process here//
        packet_number = -1;
        counter = 0;
        packet_number = 0;
        m_rng = CreateObject<UniformRandomVariable>();
        TunnelPort = UsedTunnelPort;
        UsedTunnelPort++;
        calculateOptimalTunnel();

    }
    void SetUp(Ptr<Node> rt, Ptr<Node> msIfc0, Ptr<Node> msIfc1,
               Ipv4Address rt0Addr, Ipv4Address rt1Addr, Ipv4Address msIfc0Addr, Ipv4Address msIfc1Addr, Ipv4Address v1Addr, Ipv4Address v2Addr)
    //: m_rtAddress (rtAddr), m_msIfc0Address (msIfc0Addr), m_msIfc1Address (msIfc1Addr)
    {

        m_rt0Address = rt0Addr;
        m_rt1Address = rt1Addr;
        m_msIfc0Address = msIfc0Addr;
        m_msIfc1Address = msIfc1Addr;
        // Set up the IP Tunnel here                                                //
        // Note that this is the one-directional tunnel set up                      //
        // Therefore, for rt socket, we bind it with Ipv4Address::GetAny()          //
        // For msIfc0Socket, we bind it with the old IP address of the interface    //
        // For msIfc1Socket, we bind it with the old IP address of the interface    //
        // Once we receive the packet targeting to the old IP address,              //
        // the corresponding interface will receive the packet, and call            //
        // msIfc{0,1}SocketRecv                                                     //

        m_rtSocket = Ipv4RawSocketImpl::CreateSocket(rt, TypeId::LookupByName("ns3::Ipv4RawSocketFactory"));
        m_rtSocket->Bind(InetSocketAddress(Ipv4Address::GetAny(), TunnelPort));
        m_rtSocket->SetRecvCallback(MakeCallback(&Tunnel::rtSocketRecv, this));

        m_msIfc0Socket = Ipv4RawSocketImpl::CreateSocket(msIfc0, TypeId::LookupByName("ns3::Ipv4RawSocketFactory"));

        m_msIfc0Socket->Bind(InetSocketAddress(m_msIfc0Address, TunnelPort));

        m_msIfc0Socket->SetRecvCallback(MakeCallback(&Tunnel::msIfc0SocketRecv, this));

        m_msIfc1Socket = Ipv4RawSocketImpl::CreateSocket(msIfc1, TypeId::LookupByName("ns3::Ipv4RawSocketFactory"));

        m_msIfc1Socket->Bind(InetSocketAddress(m_msIfc1Address, TunnelPort));

        m_msIfc1Socket->SetRecvCallback(MakeCallback(&Tunnel::msIfc1SocketRecv, this));

        // msIfc0 tap device                                                        //
        m_msIfc0Tap = CreateObject<VirtualNetDevice>();
        m_msIfc0Tap->SetAddress(Mac48Address::Allocate());
        m_msIfc0Tap->SetSendCallback(MakeCallback(&Tunnel::msIfcVirtualSend, this));
        msIfc0->AddDevice(m_msIfc0Tap);
        Ptr<Ipv4> ipv4 = msIfc0->GetObject<Ipv4>();
        uint32_t i = ipv4->AddInterface(m_msIfc0Tap);
        ipv4->AddAddress(i, Ipv4InterfaceAddress(v1Addr, Ipv4Mask("255.255.255.0")));
        ipv4->SetUp(i);

        // msIfc1 tap device                                                        //
        m_msIfc1Tap = CreateObject<VirtualNetDevice>();
        m_msIfc1Tap->SetAddress(Mac48Address::Allocate());
        m_msIfc1Tap->SetSendCallback(MakeCallback(&Tunnel::msIfcVirtualSend, this));
        msIfc1->AddDevice(m_msIfc1Tap);
        ipv4 = msIfc1->GetObject<Ipv4>();
        i = ipv4->AddInterface(m_msIfc1Tap);
        ipv4->AddAddress(i, Ipv4InterfaceAddress(v1Addr, Ipv4Mask("255.255.255.0")));
        ipv4->SetUp(i);

        // rt tap device
        // Once we want to send any packet from router (router, PGW)          //
        // We will call rtVirtualSend                                         //
        m_rtTap = CreateObject<VirtualNetDevice>();
        m_rtTap->SetAddress(Mac48Address::Allocate());
        m_rtTap->SetSendCallback(MakeCallback(&Tunnel::rtVirtualSend, this));
        rt->AddDevice(m_rtTap);
        ipv4 = rt->GetObject<Ipv4>();
        i = ipv4->AddInterface(m_rtTap);
        ipv4->AddAddress(i, Ipv4InterfaceAddress(v2Addr, Ipv4Mask("255.255.255.0")));
        ipv4->SetUp(i);
    }
};
//-----------------------------------------Tunneling-----------------------------//

bool firstCwnd = true;
bool firstSshThr = true;
bool firstRtt = true;
bool firstRto = true;
Ptr<OutputStreamWrapper> cWndStream;
Ptr<OutputStreamWrapper> ssThreshStream;
Ptr<OutputStreamWrapper> rttStream;
Ptr<OutputStreamWrapper> rtoStream;
Ptr<OutputStreamWrapper> nextTxStream;
Ptr<OutputStreamWrapper> nextRxStream;
Ptr<OutputStreamWrapper> inFlightStream;
vector<Ptr<OutputStreamWrapper> > throughputStream;
Ptr<OutputStreamWrapper> throughputAllDlStream;
uint32_t cWndValue;
uint32_t ssThreshValue;

vector<Ptr<PacketSink> > sink;
vector<uint64_t> lastTotalRx;
int lastTotalTxPacket = 0;
int lastTotalRxPacket = 0;


void CalculateThroughput()
{
    double totalDlThroughput = 0.0;

    for (uint16_t i = 0; i < numberUE; i++)
    {
        Time now = Simulator::Now();                                                                                               // Return the simulator time
        double cur = ((sink[i]->GetTotalRx() - lastTotalRx[i]) * (double)8 / 1e6) * (1000.0 / THROUGHPUT_MEASUREMENT_INTERVAL_MS); // Convert Application layer total RX Bytes to MBits.

        if (lastTotalRx[i] == 0)
        {
            cur = 0;
        }
        *throughputStream[i]->GetStream() << now.GetSeconds() << " " << cur << std::endl;
        lastTotalRx[i] = sink[i]->GetTotalRx();
        totalDlThroughput += cur;
    }

    // Get all Dl throughput measurement
    *throughputAllDlStream->GetStream() << Simulator::Now().GetSeconds() << " " << totalDlThroughput << std::endl;

    Simulator::Schedule(MilliSeconds(THROUGHPUT_MEASUREMENT_INTERVAL_MS), &CalculateThroughput); // Measurement Interval THROUGHPUT_MEASUREMENT_INTERVAL_MS milliseconds
}

int main(int argc, char *argv[])
{

    prefix_file_name = "scratch/CIS549";
    bool TunnelEnabled = true;
    bool enableFlowMonitor = true;
    numberUE = 1;
    int Transport = TCP_TEST;
    int DataSizeforTCP = 20000;
    double simTime = 10;
    std::string DataRateforUDP = "100Mb/s";

    // This is the one way link delay between router and PGW
    // you may change this delay for RTT variation for LTE path
    int delayValueforWifi = 20; // ms

    // This is the one way link delay between router and WiFi AP
    // you may change this delay for RTT variation for WIFI path
    int delayValueforLte = 20; // ms

    // This is the one way link delay between router and SERVER
    // If you change this value, then both Wi-Fi and LTE path RTT will be affected
    int delayValueBtwnRemoteHostAndRouter = 20; // ms

    // LTE Channel Bandwidth
    double chBwMHz = 20; // LTE default channel Bandwidth=20 MHz (100 PRBs)
    // LTE bandwidth in terms of nuymber of PRB
    int lteTotalPRBcount = 100; // reflect 20MHz

    // WIFI bandwidth
    int wifiChannelWidth = 40; // default wife width (MHz)

    int tcpSendBufBytes = 1024000;
    int tcpRcvBufBytes = 1024000; // TCP receive buffer size byte, default = 1024000 Bytes

    // if nStreams == 1 then phyRate can be up to HtMcs7
    // if nStreams == 2 then phyRate can be up to HtMcs15
    uint8_t nStreams = 1;           // wifi number of stream
    std::string phyRate = "HtMcs7"; // Wifi 802.11n MCS
    // uint8_t nStreams = 2;    // wifi number of stream
    //  std::string phyRate = "HtMcs15";   // Wifi 802.11n MCS

    CommandLine cmd;
    cmd.AddValue("simTime", "Slot time in microseconds", simTime);
    cmd.AddValue("NumberUE", "Number of UEs", numberUE);
    cmd.AddValue("Scenario", "Differnet Simulation Scenario", Scenario);
    cmd.AddValue("DataSizeforTCP", "Total Data Size for TCP (Default = 20000)", DataSizeforTCP);
    cmd.AddValue("Transport", "Transport Layer Protocol (TCP = 1, UDP = 2) (Default: TCP)", Transport);
    cmd.AddValue("DataRateforUDP", "Data Rate for UDP (Defaule = 100Mb/s)", DataRateforUDP);
    cmd.AddValue("OutputFileName", "The Prefix Output File Name (Default: scratch/MPIP_Tracing)", prefix_file_name);
    cmd.AddValue("inOrderTimeout", "The Prefix Output File Name (Default: scratch/MPIP_Tracing)", in_order_timeout); // TODO: is timeout_period the correct var and is it recheable?

    // LTE channel Bandwidth options: 1.4 MHz, 5 MHz, 10 MHz, and 20 Mhz
    cmd.AddValue("chBwMHz", "Select LTE Channel Bandwidth(Default: 20)", chBwMHz);

    cmd.AddValue("delayValueforWifi", "Delay value for wifi-router link (Default: 20 (unit:ms))", delayValueforWifi);
    cmd.AddValue("delayValueforLte", "Delay value for pgw-router link (Default: 20 (unit:ms))", delayValueforLte);
    cmd.AddValue("delayValueforRHtoR", "Delay value between Remote Host and Router (Default: 20 (unit:ms))", delayValueBtwnRemoteHostAndRouter);
    cmd.AddValue("tcpRcvBufBytes", "TCP receive buffer size byte (default : 1024000 Bytes)", tcpRcvBufBytes);
    cmd.AddValue("wifiMcs", "802.11n MCS (default : HtMcs7)", phyRate);

    cmd.AddValue("lteTotalPRBcount", "Total number of PRB for LTE (default : 100)", lteTotalPRBcount);
    cmd.AddValue("wifiChannelWidth", "Wi-Fi channel width (Default: 40 (unit: MHz))", wifiChannelWidth);
    cmd.AddValue("aggPath", "Path selection for the Aggregation( wifiOnly, lteOnly, or lteAndWifi", aggPath);

    cmd.Parse(argc, argv);

    //Create file
    AsciiTraceHelper ascii;
    queuingDelay = ascii.CreateFileStream((prefix_file_name + "_delay" + ".dat").c_str());
    receivedPacketSequenceNumberUE = ascii.CreateFileStream((prefix_file_name + "_preseq" + ".dat").c_str());
    packetSequenceToUpperLayer = ascii.CreateFileStream((prefix_file_name + "_postseq" + ".dat").c_str());


    if ((phyRate.compare("HtMcs1") == 0) || (phyRate.compare("HtMcs7") == 0))
        nStreams = 1;

    if (phyRate.compare("HtMcs15") == 0)
        nStreams = 2;

    if (Scenario == AGGREGATE)
    { // Traffic split at the router
        TunnelEnabled = true;
        if ((aggPath.compare("wifiOnly") != 0) && (aggPath.compare("lteOnly") != 0) && (aggPath.compare("lteAndWifi") != 0))
        {
            printf("You are using Traffic aggregation scenario, but the aggreagatipn method option is invalid.\n");
            printf("Choose one of these three options using \"--aggPath\" input option: wifiOnly, lteonly, lteAndWifi\n\n");
            exit(1);
        }
    }
    else if (Scenario == LTE)
    { // LTE ONLY
        TunnelEnabled = false;
    }
    else if (Scenario == WIFI)
    { // Wifi ONLY
        TunnelEnabled = false;
    }

    uint16_t numberEnb = 1;
    uint16_t numberRemote = 1;

    switch ((int)(chBwMHz * 10))
    {
    case 200:
        lteTotalPRBcount = 100; // 20 MHz : 100 PRBs
        break;
    case 100:
        lteTotalPRBcount = 50; // 10 MHz : 50 PRBs
        break;
    case 50:
        lteTotalPRBcount = 25; // 5 MHz : 25 PRBs
        break;
    case 14:
        lteTotalPRBcount = 6; // 1.4 MHz : 6 PRBs
        break;
    default:
        cout << "Error: Incorrect value for chBwMHz option." << endl;
        cout << "Error: chBwMhz option can take only 1.4, 5, 10, or 20)" << endl;
        exit(1);
        // break;
    }

    Config::SetDefault("ns3::PointToPointEpcHelper::S1uLinkDelay", TimeValue(MilliSeconds(1.0))); // delay between SGW and eNB

    // Configuration for LTE link                                               //
    Config::SetDefault("ns3::MacStatsCalculator::DlOutputFilename", StringValue(prefix_file_name + "-DlMacStats.dat"));
    Config::SetDefault("ns3::MacStatsCalculator::UlOutputFilename", StringValue(prefix_file_name + "-UlMacStats.dat"));
    Config::SetDefault("ns3::LteEnbNetDevice::DlBandwidth", UintegerValue(lteTotalPRBcount));
    Config::SetDefault("ns3::LteEnbNetDevice::UlBandwidth", UintegerValue(lteTotalPRBcount));
    Config::SetDefault("ns3::LteRlcUm::MaxTxBufferSize", UintegerValue(20000000)); // AM/UM

    // Configuration for WiFi link
    Config::SetDefault("ns3::WifiMacQueue::MaxPacketNumber", UintegerValue(10000000));
    Config::SetDefault("ns3::WifiMacQueue::MaxDelay", TimeValue(MilliSeconds(1000.0)));

    // Transmission mode (SISO [0], MIMO [1])                                   //
    Config::SetDefault("ns3::LteEnbRrc::DefaultTransmissionMode", UintegerValue(0)); // do not modify this value

    ConfigStore inputConfig;
    inputConfig.ConfigureDefaults();

    // Create the nodes in this simulation                                      //
    // Create node 0: server                                                    //
    NodeContainer remoteHostContainer;
    remoteHostContainer.Create(numberRemote);
    Ptr<Node> remoteHost = remoteHostContainer.Get(0);

    // Create node 1: router                                                    //
    NodeContainer router;
    router.Create(1);

    // The initialization of PGW is inside the PointToPointEpcHelper            //
    // Create node 2: PGW                                                       //
    // Create node 3: Dummy node                                                //
    Ptr<LteHelper> lteHelper;
    Ptr<PointToPointEpcHelper> epcHelper;
    NodeContainer pgwContainer;
    if (Scenario != WIFI)
    {
        lteHelper = CreateObject<LteHelper>();
        epcHelper = CreateObject<PointToPointEpcHelper>();
        lteHelper->SetEpcHelper(epcHelper);

        lteHelper->SetSchedulerType("ns3::RrFfMacScheduler");

        lteHelper->SetAttribute("PathlossModel", StringValue("ns3::FriisPropagationLossModel"));
    }
    else
    {
        pgwContainer.Create(2);
    }
    Ptr<Node> pgw;
    Ptr<Node> dummyNode;
    if (Scenario != WIFI)
    {
        pgw = epcHelper->GetPgwNode();
        dummyNode = epcHelper->GetSegwNode();
    }
    else
    {
        pgw = pgwContainer.Get(0);
        dummyNode = pgwContainer.Get(1);
    }
    // Create node 4: enb                                                       //
    NodeContainer enbNodes;
    enbNodes.Create(numberEnb);
    // Create node 5: AP                                                        //
    NodeContainer apWiFiNode;
    apWiFiNode.Create(1);
    // Create node 6: UE                                                        //
    NodeContainer ueNodes;
    ueNodes.Create(numberUE);
    // Installing the Internet Stack for server, every UE, router, and WiFi AP  //
    InternetStackHelper internet;
    internet.Install(remoteHost);
    internet.Install(ueNodes);
    internet.Install(router);
    internet.Install(apWiFiNode);
    if (Scenario == WIFI)
    {
        internet.Install(pgw);
    }

    //--------------------------------MOBILITY MODEL-------------------------------
    // Set up mobility model for every node by (x,y,z), unit: meters            //
    // Mobility Model for UE                                                    //

    double ueXmin = 1.0;
    double ueXmax = 8.0;
    double ueYmin = 12;
    double ueYmax = 30;
    Ptr<UniformRandomVariable> ueX = CreateObject<UniformRandomVariable>();
    Ptr<UniformRandomVariable> ueY = CreateObject<UniformRandomVariable>();
    ueX->SetAttribute("Min", DoubleValue(ueXmin));
    ueX->SetAttribute("Max", DoubleValue(ueXmax));
    ueY->SetAttribute("Min", DoubleValue(ueYmin));
    ueY->SetAttribute("Max", DoubleValue(ueYmax));

    Ptr<ListPositionAllocator> positionAlloc1 = CreateObject<ListPositionAllocator>();
    for (uint16_t i = 1; i <= ueNodes.GetN(); i++)
    {
        positionAlloc1->Add(Vector(ueX->GetValue(), ueY->GetValue(), 0));
    }

    MobilityHelper mobilityUe;
    mobilityUe.SetMobilityModel("ns3::ConstantPositionMobilityModel");
    mobilityUe.SetPositionAllocator(positionAlloc1);
    mobilityUe.Install(ueNodes);

    // Mobility Model for eNB
    Ptr<ListPositionAllocator> positionAlloc2 = CreateObject<ListPositionAllocator>();
    positionAlloc2->Add(Vector(12, 12, 0)); // eNB position, this is used for animation positin as well

    MobilityHelper mobilityEnb;
    mobilityEnb.SetMobilityModel("ns3::ConstantPositionMobilityModel");
    mobilityEnb.SetPositionAllocator(positionAlloc2);
    mobilityEnb.Install(enbNodes);

    // The location of server, router, and segw is not important                //
    mobilityEnb.Install(remoteHost);
    mobilityEnb.Install(router);
    mobilityEnb.Install(dummyNode);

    // Mobility Model for WiFi AP                                               //
    Ptr<ListPositionAllocator> positionAlloc3 = CreateObject<ListPositionAllocator>();
    positionAlloc3->Add(Vector(12, 28.2, 0)); // Wi-Fi AP position, this is used for animation positin as well

    MobilityHelper mobilityAP;
    mobilityAP.SetMobilityModel("ns3::ConstantPositionMobilityModel");
    mobilityAP.SetPositionAllocator(positionAlloc3);
    mobilityAP.Install(apWiFiNode);

    // Install LTE Devices for User                                             //

    NetDeviceContainer enbLteDevs;
    NetDeviceContainer ueLteDevs;
    Ipv4InterfaceContainer ueIpIface;

    if (Scenario != WIFI)
    {
        enbLteDevs = lteHelper->InstallEnbDevice(enbNodes);
        ueLteDevs = lteHelper->InstallUeDevice(ueNodes);
        ueIpIface = epcHelper->AssignUeIpv4Address(NetDeviceContainer(ueLteDevs));

        // Set up the IP for UE from LTE                                            //
        for (uint32_t u = 0; u < ueNodes.GetN(); ++u)
        {
            Ptr<Node> ueNode = ueNodes.Get(u);
            Ipv4StaticRoutingHelper ipv4RoutingHelper;
            Ptr<Ipv4StaticRouting> ueStaticRouting = ipv4RoutingHelper.GetStaticRouting(ueNode->GetObject<Ipv4>());
            ueStaticRouting->AddNetworkRouteTo(Ipv4Address("10.1.1.0"), Ipv4Mask("255.255.255.0"), 1);
            ueStaticRouting->AddNetworkRouteTo(Ipv4Address("10.1.2.0"), Ipv4Mask("255.255.255.0"), 1);
        }

        // Attach UE to LTE
        for (uint16_t i = 0; i < ueNodes.GetN(); i++)
        {
            lteHelper->Attach(ueLteDevs.Get(i), enbLteDevs.Get(0));
        }
    }

    // Set up WiFi parameter                                                    //
    // We use 802.11n in 5GHz in this case                                      //

    WifiMacHelper wifiMac;
    WifiHelper wifiHelper;
    wifiHelper.SetStandard(WIFI_PHY_STANDARD_80211n_5GHZ);

    // Set up Legacy Channel                                                    //
    // The propagation loss model is Friis

    YansWifiChannelHelper wifiChannel;
    wifiChannel.SetPropagationDelay("ns3::ConstantSpeedPropagationDelayModel");
    wifiChannel.AddPropagationLoss("ns3::FriisPropagationLossModel", "Frequency", DoubleValue(5e9));

    // Setup the physical layer of WiFi                                         //

    YansWifiPhyHelper wifiPhy = YansWifiPhyHelper::Default();
    wifiPhy.SetChannel(wifiChannel.Create());

    // In this version, the number of streams is set up by Tx/RxAntennas        //
    // You can manually set up the MCS level
    // The method of setting is HtMcs1->HtMcs15                                 //

    wifiPhy.Set("TxAntennas", UintegerValue(nStreams));
    wifiPhy.Set("RxAntennas", UintegerValue(nStreams));
    wifiHelper.SetRemoteStationManager("ns3::ConstantRateWifiManager", "DataMode", StringValue(phyRate), "ControlMode", StringValue("HtMcs0"));

    // Configure AP                                                             //
    Ssid ssid = Ssid("network");
    wifiMac.SetType("ns3::ApWifiMac", "Ssid", SsidValue(ssid));
    NetDeviceContainer apDevice;
    apDevice = wifiHelper.Install(wifiPhy, wifiMac, apWiFiNode);

    // Configure STA                                                            //
    wifiMac.SetType("ns3::StaWifiMac", "Ssid", SsidValue(ssid));
    NetDeviceContainer staDevices;
    staDevices = wifiHelper.Install(wifiPhy, wifiMac, ueNodes);

    // Set wifi channel width
    Config::Set("/NodeList/*/DeviceList/*/$ns3::WifiNetDevice/Phy/ChannelWidth", UintegerValue(wifiChannelWidth));

    // Set up the IP address for this wifi network                              //
    Ipv4AddressHelper ipv4h;
    ipv4h.SetBase("192.168.0.0", "255.255.255.0");
    Ipv4InterfaceContainer WiFiInterface = ipv4h.Assign(NetDeviceContainer(apDevice, staDevices));

    //------------------------Connect them together---------------------------------//

    // Create a p2p link for the pgw and the router
    // Create a p2p link for the wifi AP and the router
    // Create a p2p link for the pgw and the wifi AP

    PointToPointHelper p2ph;

    // Create a p2p link for the server and the router
    p2ph.SetDeviceAttribute("DataRate", DataRateValue(DataRate("100Gb/s")));
    p2ph.SetChannelAttribute("Delay", TimeValue(MilliSeconds(delayValueBtwnRemoteHostAndRouter)));
    NetDeviceContainer internetDevices1 = p2ph.Install(router.Get(0), remoteHost);

    p2ph.SetDeviceAttribute("DataRate", DataRateValue(DataRate("100Gb/s")));
    p2ph.SetChannelAttribute("Delay", TimeValue(MilliSeconds(delayValueforLte)));
    NetDeviceContainer internetDevices2 = p2ph.Install(pgw, router.Get(0));

    p2ph.SetDeviceAttribute("DataRate", DataRateValue(DataRate("100Gb/s")));
    p2ph.SetChannelAttribute("Delay", TimeValue(MilliSeconds(delayValueforWifi)));
    NetDeviceContainer internetDevices3 = p2ph.Install(apWiFiNode.Get(0), router.Get(0));

    p2ph.SetDeviceAttribute("DataRate", DataRateValue(DataRate("100Gb/s")));
    p2ph.SetChannelAttribute("Delay", TimeValue(MilliSeconds(1)));
    NetDeviceContainer internetDevices4 = p2ph.Install(pgw, apWiFiNode.Get(0));

    // Set up the IP address for every p2p link                                 //
    // For simplicity, we assume every p2p link has its own subnet address       //
    // Setup IP address for every P2P link

    ipv4h.SetBase("10.1.1.0", "255.255.255.0");
    Ipv4InterfaceContainer internetIpIfaces1;
    internetIpIfaces1 = ipv4h.Assign(internetDevices1);

    ipv4h.SetBase("10.1.2.0", "255.255.255.0");
    Ipv4InterfaceContainer internetIpIfaces2;
    internetIpIfaces2 = ipv4h.Assign(internetDevices2);

    ipv4h.SetBase("10.1.3.0", "255.255.255.0");
    Ipv4InterfaceContainer internetIpIfaces3;
    internetIpIfaces3 = ipv4h.Assign(internetDevices3);

    ipv4h.SetBase("10.1.4.0", "255.255.255.0");
    Ipv4InterfaceContainer internetIpIfaces4;
    internetIpIfaces4 = ipv4h.Assign(internetDevices4);

    // Build up the static routing manually                                     //
    // Set up the routing table for the server                                  //

    if (Scenario != WIFI)
    {
        Ipv4StaticRoutingHelper ipv4RoutingHelper;
        Ptr<Ipv4StaticRouting> remoteHostStaticRouting = ipv4RoutingHelper.GetStaticRouting(remoteHost->GetObject<Ipv4>());
        remoteHostStaticRouting->AddNetworkRouteTo(Ipv4Address("7.0.0.0"), Ipv4Mask("255.0.0.0"), 1);
        remoteHostStaticRouting->AddNetworkRouteTo(Ipv4Address("192.168.0.0"), Ipv4Mask("255.255.255.0"), 1);

        // Set up the routing table for the router                                  //
        Ptr<Ipv4StaticRouting> routerStaticRouting = ipv4RoutingHelper.GetStaticRouting(router.Get(0)->GetObject<Ipv4>());
        routerStaticRouting->AddNetworkRouteTo(Ipv4Address("7.0.0.0"), Ipv4Mask("255.0.0.0"), 2);
        // This is the routing entry when you need to use wifi-only                    //
        routerStaticRouting->AddNetworkRouteTo(Ipv4Address("192.168.0.0"), Ipv4Mask("255.255.255.0"), 3);
        routerStaticRouting->AddNetworkRouteTo(Ipv4Address("10.1.1.0"), Ipv4Mask("255.255.255.0"), 1);

        // Set up the routing table for the wifi                                    //
        Ptr<Ipv4StaticRouting> apStaticRouting = ipv4RoutingHelper.GetStaticRouting(apWiFiNode.Get(0)->GetObject<Ipv4>());
        apStaticRouting->AddNetworkRouteTo(Ipv4Address("10.1.3.0"), Ipv4Mask("255.255.255.0"), 2);

        Ptr<Ipv4StaticRouting> staStaticRouting = ipv4RoutingHelper.GetStaticRouting(ueNodes.Get(0)->GetObject<Ipv4>());
        staStaticRouting->AddNetworkRouteTo(Ipv4Address("10.1.3.0"), Ipv4Mask("255.255.255.0"), Ipv4Address("192.168.0.1"), 2);
        staStaticRouting->AddNetworkRouteTo(Ipv4Address("192.168.0.0"), Ipv4Mask("255.255.0.0"), 2);

        // Set up the routing table for the P-GW                                    //
        // We force the packet to WiFi requiring to go to P-GW first                //
        Ptr<Ipv4StaticRouting> pgwStaticRouting = ipv4RoutingHelper.GetStaticRouting(pgw->GetObject<Ipv4>());
        pgwStaticRouting->AddNetworkRouteTo(Ipv4Address("10.1.1.0"), Ipv4Mask("255.255.255.0"), 3);
        pgwStaticRouting->AddNetworkRouteTo(Ipv4Address("192.168.0.0"), Ipv4Mask("255.255.255.0"), 4);

        Ptr<OutputStreamWrapper> routingStream = Create<OutputStreamWrapper>(prefix_file_name + ".routes", std::ios::out);
        ipv4RoutingHelper.PrintRoutingTableAllEvery(Seconds(0.1), routingStream);
    }
    else
    {
        Ipv4GlobalRoutingHelper::PopulateRoutingTables();
        Ptr<OutputStreamWrapper> routingStream = Create<OutputStreamWrapper>(prefix_file_name + ".routes", std::ios::out);
        Ipv4GlobalRoutingHelper ipv4RoutingHelper;
        ipv4RoutingHelper.PrintRoutingTableAllAt(Seconds(0.1), routingStream);
    }

    //--------------------------------------------------------------------------//
    // Set up the Tunnel                                                        //
    // Input 1 = Tunnel rt (router, pgw, segw)                                  //
    // Input 2 = Tunnel ms (mobile station)                                     //
    // Input 3 = Tunnel ms (mobile station)                                     //
    // Input 4 = Original IP address of rt interface 1 tunnel                   //
    // Input 5 = Original IP address of rt interface 2 tunnel                   //
    // Input 6 = Original IP address of ms interface 1 tunnel                   //
    // Input 7 = Original IP address of ms interface 2 tunnel                   //
    // Input 8 = New virtual IP address for both interfaces of tunnel ms        //
    // Input 9 = New virtual IP address of tunnel rt                            //

    Tunnel tunnel[ueNodes.GetN()];
    for (uint16_t i = 0; i < ueNodes.GetN(); i++)
    {
        string TunnelDestination = "11.0." + std::to_string(i) + ".1";
        string TunnelSource = "11.0." + std::to_string(i) + ".254";
        if (TunnelEnabled && (Scenario == AGGREGATE))
        {
            tunnel[i].SetUp(router.Get(0), ueNodes.Get(i), ueNodes.Get(i),
                            internetIpIfaces2.GetAddress(1), internetIpIfaces3.GetAddress(1), ueIpIface.GetAddress(i), WiFiInterface.GetAddress(i + 1), TunnelDestination.c_str(), TunnelSource.c_str());
        }
    }

    //////////////////////////////////////////////////////////////////////////////
    // Set up the routing table for virtual IP address                          //
    // If you want to set up the tunnel rt as the trasmistter,                  //
    // you "SHOULD" manually add the routing table here                         //

    if (TunnelEnabled)
    {
        Ipv4StaticRoutingHelper ipv4RoutingHelper;
        Ptr<Ipv4StaticRouting> remoteHostStaticRouting = ipv4RoutingHelper.GetStaticRouting(remoteHost->GetObject<Ipv4>());
        remoteHostStaticRouting->AddNetworkRouteTo(Ipv4Address("11.0.0.0"), Ipv4Mask("255.255.0.0"), 1);
        Ptr<Ipv4StaticRouting> routerStaticRouting = ipv4RoutingHelper.GetStaticRouting(router.Get(0)->GetObject<Ipv4>());
        routerStaticRouting->AddNetworkRouteTo(Ipv4Address("11.0.0.0"), Ipv4Mask("255.255.0.0"), 2);
    }

    // Set up TCP application from the server to the user                       //
    // The MTU size is set up in SegmentSize                                    //
    // The maximum congestion window is set up in SndBufSize and RcvBufSize     //
    // This is a FTP download application with MaxBytes (arbitrary)             //

    double tcpAppStartTime = 1.0;

    for (uint16_t i = 0; i < ueNodes.GetN(); i++)
    {
        Ipv4Address DestAddr;
        if (Scenario == AGGREGATE)
        {
            DestAddr = ("11.0." + to_string(i) + ".1").c_str();
        }
        else if (Scenario == WIFI)
        {
            DestAddr = WiFiInterface.GetAddress(i + 1);
        }
        else
        {
            DestAddr = ueIpIface.GetAddress(i);
        }
        if (Transport == TCP_TEST)
        {
            uint16_t port = 50000;
            Config::SetDefault("ns3::TcpSocket::SegmentSize", UintegerValue(1400)); // MSS size setting, don't need to change
            Config::SetDefault("ns3::TcpSocket::SndBufSize", UintegerValue(tcpSendBufBytes));
            Config::SetDefault("ns3::TcpSocket::RcvBufSize", UintegerValue(tcpRcvBufBytes)); // Receiver buffer size

            Address sinkLocalAddress(InetSocketAddress(Ipv4Address::GetAny(), port));
            PacketSinkHelper sinkHelper("ns3::TcpSocketFactory", sinkLocalAddress);
            AddressValue sinkAddress(InetSocketAddress(DestAddr, port));
            BulkSendHelper ftp("ns3::TcpSocketFactory", Address());
            ftp.SetAttribute("Remote", sinkAddress);
            ftp.SetAttribute("SendSize", UintegerValue(1400));           // don't need to change
            ftp.SetAttribute("MaxBytes", UintegerValue(DataSizeforTCP)); // File size (Bytes)

            ApplicationContainer sourceApp = ftp.Install(remoteHost);
            sourceApp.Start(Seconds(tcpAppStartTime));
            sourceApp.Stop(Seconds(simTime));

            sinkHelper.SetAttribute("Protocol", TypeIdValue(TcpSocketFactory::GetTypeId()));
            ApplicationContainer sinkApp = sinkHelper.Install(ueNodes.Get(i));
            Ptr<PacketSink> sink_temp = StaticCast<PacketSink>(sinkApp.Get(0));
            sink.push_back(sink_temp);

            sinkApp.Start(Seconds(tcpAppStartTime));
            sinkApp.Stop(Seconds(simTime));
        }
        else if (Transport == UDP_TEST)
        {
            uint16_t port = 9;
            OnOffHelper onoff("ns3::UdpSocketFactory", Address(InetSocketAddress(DestAddr, port)));
            onoff.SetConstantRate(DataRate(DataRateforUDP)); // data transmission rate
            onoff.SetAttribute("PacketSize", UintegerValue(1400));

            ApplicationContainer apps = onoff.Install(remoteHost);
            apps.Start(Seconds(1.0));
            apps.Stop(Seconds(simTime));

            // Create a packet sink to receive these packets
            PacketSinkHelper sinkHelper("ns3::UdpSocketFactory", Address(InetSocketAddress(Ipv4Address::GetAny(), port)));
            apps = sinkHelper.Install(ueNodes.Get(i));
            Ptr<PacketSink> sink_temp = StaticCast<PacketSink>(apps.Get(0));
            sink.push_back(sink_temp);
            apps.Start(Seconds(1.0));
            apps.Stop(Seconds(simTime));
        }
        else
        {
            printf("ERROR: Transport should be 1 for TCP test or 2 for UDP test.\n");
            exit(1);
        }
    }

    // EDIT START

    // commented out to save disk space
    p2ph.EnablePcap(prefix_file_name, 0, 1);
    p2ph.EnablePcap(prefix_file_name, 1, 1);
    p2ph.EnablePcap(prefix_file_name, 1, 2);
    p2ph.EnablePcap(prefix_file_name, 1, 3);

    // EDIT END

    // Capture all packets information
    // File name is prefix_file_name+"_trace.tr"                                //
    // AsciiTraceHelper ascii;
    // p2ph.EnableAsciiAll (ascii.CreateFileStream (prefix_file_name+"_trace.tr"));

    // The Animation Setup is setup in this part                                //
    // SetConstantPosition is used to set up the position for every node        //
    // UpdateNodeDescription is used to set up the name for every node          //
    // UpdateNodeColor is used to set up the color for every node               //
    // "DO NOT" set up the poistions after calling anim("document_name")        //

    AnimationInterface::SetConstantPosition(remoteHost, 45.0, 20);
    AnimationInterface::SetConstantPosition(router.Get(0), 33.75, 20);
    AnimationInterface::SetConstantPosition(pgw, 28.2, 12);
    AnimationInterface anim(prefix_file_name + "-animation.xml");

    //////////////////////////
    // change the absolute path below to the path where your image file is stored
    //
    serverImgId = anim.AddResource("/home/cis549/Downloads/server2.png");
    routerImgId = anim.AddResource("/home/cis549/Downloads/router2.png");
    pgwImgId = anim.AddResource("/home/cis549/Downloads/pgw2.png");
    enbImgId = anim.AddResource("/home/cis549/Downloads/enb2.png");
    wifiapImgId = anim.AddResource("/home/cis549/Downloads/wifiap2.png");
    ueImgId = anim.AddResource("/home/cis549/Downloads/ue2.png");

    // set node image
    anim.UpdateNodeImage(remoteHost->GetId(), serverImgId);
    anim.UpdateNodeImage(router.Get(0)->GetId(), routerImgId);
    anim.UpdateNodeImage(pgw->GetId(), pgwImgId);
    anim.UpdateNodeImage(enbNodes.Get(0)->GetId(), enbImgId);
    anim.UpdateNodeImage(apWiFiNode.Get(0)->GetId(), wifiapImgId);

    // set node image size
    double nodeImageSize = 4;
    anim.UpdateNodeSize(remoteHost->GetId(), nodeImageSize * 1.5, nodeImageSize * 0.5);
    anim.UpdateNodeSize(router.Get(0)->GetId(), nodeImageSize * 0.8, nodeImageSize * 0.8);
    anim.UpdateNodeSize(pgw->GetId(), nodeImageSize, nodeImageSize);
    anim.UpdateNodeSize(enbNodes.Get(0)->GetId(), nodeImageSize * 1.4, nodeImageSize * 1.4);
    anim.UpdateNodeSize(apWiFiNode.Get(0)->GetId(), nodeImageSize * 1.5, nodeImageSize * 1.5);

    ///////////////////////////////
    anim.UpdateNodeDescription(enbNodes.Get(0), "eNB");
    anim.UpdateNodeDescription(apWiFiNode.Get(0), "WiFi AP");
    anim.UpdateNodeDescription(remoteHost, "Server");
    for (uint16_t i = 0; i < ueNodes.GetN(); i++)
    {
        anim.UpdateNodeDescription(ueNodes.Get(i), "user" + to_string(i));
        anim.UpdateNodeImage(ueNodes.Get(i)->GetId(), ueImgId);
        anim.UpdateNodeSize(ueNodes.Get(i)->GetId(), nodeImageSize, nodeImageSize);
    }
    anim.UpdateNodeDescription(router.Get(0), "Router");
    anim.UpdateNodeDescription(pgw, "PGW");

    ///////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////
    // Throughput measurement
    AsciiTraceHelper ascii_throughput;
    for (uint16_t i = 0; i < ueNodes.GetN(); i++)
    {
        Ptr<OutputStreamWrapper> throughputStream_temp = ascii.CreateFileStream((prefix_file_name + "-throughput-ue" + to_string(i + 1) + ".dat").c_str());
        throughputStream.push_back(throughputStream_temp);
        int lastTotalRx_temp = 0;
        lastTotalRx.push_back(lastTotalRx_temp);
    }

    // Create throughput measurement file
    throughputAllDlStream = ascii.CreateFileStream((prefix_file_name + "-throughput-ue-all" + ".dat").c_str());
    // ascii.CreateFileStream((prefix_file_name + "_delay" + ".dat").c_str());
    prefix_thp_in_lte = ascii.CreateFileStream((prefix_file_name + "_thp_in_lte" + ".dat").c_str());
    prefix_thp_in_wifi = ascii.CreateFileStream((prefix_file_name + "_thp_in_wifi" + ".dat").c_str());
    prefix_dly_in_lte = ascii.CreateFileStream((prefix_file_name + "_dly_in_lte" + ".dat").c_str());
    prefix_dly_in_wifi = ascii.CreateFileStream((prefix_file_name + "_dly_in_wifi" + ".dat").c_str());

    prefix_input_rate_lte = ascii.CreateFileStream((prefix_file_name + "_input_rate_lte" + ".dat").c_str());
    prefix_input_rate_wifi = ascii.CreateFileStream((prefix_file_name + "_input_rate_wifi" + ".dat").c_str());
    

    // User downlink throughput measurement (bps)
    Simulator::Schedule(Seconds(0.1), &CalculateThroughput);
    ////////////////////////////////////////////////////////////////////

    // Setup LTE MAC trace file
    if (Scenario != WIFI)
    {
        lteHelper->EnableMacTraces();
    }

    // Set up the flow monitor to calculate the throughput                      //
    FlowMonitorHelper flowmonHelper;
    if (enableFlowMonitor)
    {
        flowmonHelper.InstallAll();
    }
    //---------------------- Simulation Stopping Time ------------------------------//
    Simulator::Stop(SIMULATION_TIME_FORMAT(simTime));
    //------------------------------------------------------------------------------//

    //--------------------------- Simulation Run -----------------------------------//
    Simulator::Run();
    if (enableFlowMonitor)
    {
        flowmonHelper.SerializeToXmlFile(prefix_file_name + ".flowmon", false, false);
    }
    Simulator::Destroy();
    //----------------------------------------------------------------------//
    return EXIT_SUCCESS;
}
