/**
 * Web Resource DOS Scenario
 *
 * Scenario: DDoS attack on e-commerce platform during peak sales period
 * with application layer (Layer 7) component.
 */

import { Scenario } from './index';

export const webDosScenario: Scenario = {
  id: 'web_dos',
  name: 'Web Resource DOS',
  description: 'Multi-vector DDoS attack on e-commerce platform during Black Friday sales',
  icon: 'Globe',
  severity: 'high',

  incidentDescription: {
    description: `On November 24 (Black Friday), the e-commerce platform experienced severe degradation starting at 06:00 AM. Traffic spiked to 50x normal levels with characteristics of a coordinated DDoS attack.

The attack included both volumetric (UDP flood) and application layer (HTTP POST flood targeting checkout API) components. The origin appears to be a botnet with IPs distributed across multiple countries. Revenue impact estimated at $500K/hour during peak shopping period.`,
    startDate: '2024-11-24T06:00:00Z',
    endDate: '2024-11-24T14:00:00Z',
    patientZero: 'LB-PROD-01',
    affectedSystems: [
      'LB-PROD-01',
      'LB-PROD-02',
      'WEB-PROD-01',
      'WEB-PROD-02',
      'WEB-PROD-03',
      'WEB-PROD-04',
      'API-PROD-01',
      'API-PROD-02',
      'CDN-EDGE',
    ],
    iocs: [
      { type: 'ip_range', value: '185.220.0.0/16' },
      { type: 'ip_range', value: '91.243.0.0/16' },
      { type: 'ip_range', value: '45.155.0.0/16' },
      { type: 'user_agent', value: 'python-requests/2.28.0' },
      { type: 'user_agent', value: 'Mozilla/5.0 (compatible; DDoS-Bot)' },
      { type: 'url_pattern', value: '/api/v2/checkout/process' },
      { type: 'url_pattern', value: '/api/v2/cart/validate' },
    ],
  },

  organizationContext: {
    documents: [
      { id: 'doc-1', filename: 'Infrastructure_Diagram.pdf', type: 'pdf', status: 'parsed' },
      { id: 'doc-2', filename: 'DDoS_Response_Playbook.docx', type: 'docx', status: 'parsed' },
      { id: 'doc-3', filename: 'CDN_Configuration.xlsx', type: 'xlsx', status: 'parsed' },
    ],
    extractedSystems: [
      { hostname: 'LB-PROD-01', ip: '10.100.1.10', role: 'Load Balancer (Primary)', criticality: 'critical' },
      { hostname: 'LB-PROD-02', ip: '10.100.1.11', role: 'Load Balancer (Secondary)', criticality: 'critical' },
      { hostname: 'WEB-PROD-01', ip: '10.100.2.10', role: 'Web Server', criticality: 'high' },
      { hostname: 'WEB-PROD-02', ip: '10.100.2.11', role: 'Web Server', criticality: 'high' },
      { hostname: 'WEB-PROD-03', ip: '10.100.2.12', role: 'Web Server', criticality: 'high' },
      { hostname: 'WEB-PROD-04', ip: '10.100.2.13', role: 'Web Server', criticality: 'high' },
      { hostname: 'API-PROD-01', ip: '10.100.3.10', role: 'API Server', criticality: 'critical' },
      { hostname: 'API-PROD-02', ip: '10.100.3.11', role: 'API Server', criticality: 'critical' },
      { hostname: 'DB-PROD-01', ip: '10.100.4.10', role: 'Database', criticality: 'critical' },
      { hostname: 'CACHE-01', ip: '10.100.5.10', role: 'Redis Cache', criticality: 'high' },
    ],
    extractedNetworks: [
      { name: 'Public Edge', cidr: '203.0.113.0/24', vlan: 1, purpose: 'Public-facing services' },
      { name: 'Web Tier', cidr: '10.100.2.0/24', vlan: 102, purpose: 'Web servers' },
      { name: 'API Tier', cidr: '10.100.3.0/24', vlan: 103, purpose: 'API servers' },
      { name: 'Data Tier', cidr: '10.100.4.0/24', vlan: 104, purpose: 'Databases' },
    ],
  },

  connectors: [
    { id: 'conn-1', name: 'Cloudflare', type: 'cdn', category: 'cloud', status: 'connected' },
    { id: 'conn-2', name: 'AWS WAF', type: 'waf', category: 'cloud', status: 'connected' },
    { id: 'conn-3', name: 'F5 Load Balancer', type: 'loadbalancer', category: 'peripheral', status: 'connected' },
    { id: 'conn-4', name: 'New Relic APM', type: 'apm', category: 'cloud', status: 'connected' },
    { id: 'conn-5', name: 'AWS CloudWatch', type: 'monitoring', category: 'cloud', status: 'connected' },
  ],

  timelineEvents: [
    {
      id: 'evt-001',
      timestamp: '2024-11-24T05:45:00Z',
      source: 'Cloudflare',
      category: 'network',
      severity: 'medium',
      title: 'Traffic Anomaly Detected',
      description: 'Gradual increase in traffic from unusual geographic regions',
      rawLog: `Zone: shop.acme.com
Metric: requests_per_second
Baseline: 500/s
Current: 2,500/s
SourceCountries: RU(30%), CN(25%), BR(20%), Other(25%)
Alert: Traffic 5x baseline from new regions`,
    },
    {
      id: 'evt-002',
      timestamp: '2024-11-24T06:00:00Z',
      source: 'Cloudflare',
      category: 'attack',
      severity: 'critical',
      title: 'DDoS Attack Detected',
      description: 'Large-scale volumetric DDoS attack initiated',
      rawLog: `Zone: shop.acme.com
AttackType: UDP Flood + HTTP Flood
RequestsPerSecond: 50,000
BandwidthGbps: 45
UniqueIPs: 125,000
TopASNs: AS12345, AS67890, AS11111
MitigationStatus: Active`,
    },
    {
      id: 'evt-003',
      timestamp: '2024-11-24T06:05:00Z',
      source: 'F5 Load Balancer',
      category: 'performance',
      severity: 'high',
      title: 'Connection Pool Exhaustion',
      description: 'Load balancer connection pools approaching limits',
      rawLog: `Device: LB-PROD-01
ConnectionsActive: 98,500
ConnectionsMax: 100,000
CPU: 92%
Memory: 87%
PoolStatus: CRITICAL
VirtualServers: shop.acme.com (degraded)`,
    },
    {
      id: 'evt-004',
      timestamp: '2024-11-24T06:10:00Z',
      source: 'New Relic',
      category: 'application',
      severity: 'critical',
      title: 'API Response Time Degradation',
      description: 'Checkout API experiencing severe latency',
      rawLog: `Application: shop-api
Endpoint: /api/v2/checkout/process
ResponseTime_p99: 45,000ms (baseline: 200ms)
ErrorRate: 78%
Throughput: 12,000 rpm (baseline: 2,000 rpm)
Status: CRITICAL`,
    },
    {
      id: 'evt-005',
      timestamp: '2024-11-24T06:15:00Z',
      source: 'AWS WAF',
      category: 'attack',
      severity: 'critical',
      title: 'Layer 7 Attack Pattern Identified',
      description: 'Application layer attack targeting checkout endpoints',
      rawLog: `RuleGroup: AWSManagedRulesCommonRuleSet
Rule: CrossSiteScripting_BODY
Action: COUNT (not blocking)
RequestPattern: POST /api/v2/checkout/process
Payload: Randomized 50KB POST bodies
MatchedRequests: 25,000/min
UserAgent: python-requests/2.28.0`,
    },
    {
      id: 'evt-006',
      timestamp: '2024-11-24T06:30:00Z',
      source: 'CloudWatch',
      category: 'infrastructure',
      severity: 'high',
      title: 'Auto-Scaling Triggered',
      description: 'EC2 auto-scaling adding instances',
      rawLog: `AutoScalingGroup: web-prod-asg
Event: LAUNCH
DesiredCapacity: 4 -> 8
Reason: CPU > 80% for 5 minutes
NewInstances: i-0abc123, i-0def456, i-0ghi789, i-0jkl012
Status: InService pending`,
    },
    {
      id: 'evt-007',
      timestamp: '2024-11-24T07:00:00Z',
      source: 'Monitoring',
      category: 'business',
      severity: 'critical',
      title: 'Revenue Impact Alert',
      description: 'Checkout conversion rate dropped to near zero',
      rawLog: `Metric: checkout_conversion_rate
Baseline: 3.2%
Current: 0.1%
LostRevenue: $125,000 (last hour)
OrdersCompleted: 47 (baseline: 2,500)
CartAbandonment: 99.2%
Alert: CRITICAL business impact`,
    },
    {
      id: 'evt-008',
      timestamp: '2024-11-24T08:00:00Z',
      source: 'Cloudflare',
      category: 'mitigation',
      severity: 'medium',
      title: 'Rate Limiting Enabled',
      description: 'Emergency rate limiting rules deployed',
      rawLog: `Zone: shop.acme.com
Action: Rate Limit Rule Created
Threshold: 100 requests/10s per IP
Scope: /api/*
BlockedIPs: 45,000
PassthroughRate: 40%
Effect: Partial mitigation`,
    },
    {
      id: 'evt-009',
      timestamp: '2024-11-24T10:00:00Z',
      source: 'Cloudflare',
      category: 'mitigation',
      severity: 'medium',
      title: 'Under Attack Mode Activated',
      description: 'Cloudflare Under Attack Mode with JavaScript challenge',
      rawLog: `Zone: shop.acme.com
Mode: Under Attack
Challenge: JavaScript Challenge
PassRate: 15% (legitimate users)
BlockRate: 85% (bots)
Latency: +5s for new visitors
Status: Active`,
    },
    {
      id: 'evt-010',
      timestamp: '2024-11-24T14:00:00Z',
      source: 'Security Team',
      category: 'incident',
      severity: 'info',
      title: 'Attack Subsided',
      description: 'DDoS attack intensity decreased, services recovering',
      rawLog: `Duration: 8 hours
PeakTraffic: 50Gbps
TotalRequests: 2.1 billion
UniqueAttackerIPs: 180,000
EstimatedRevenueLoss: $4.2M
SystemsAffected: 9
CurrentStatus: Recovering
Mitigation: Ongoing (rate limiting active)`,
    },
  ],

  findings: [
    {
      id: 'find-001',
      title: 'Multi-Vector DDoS Attack',
      description: 'Attack combined volumetric (UDP flood) and application layer (HTTP POST) vectors',
      severity: 'critical',
      confidence: 98,
      category: 'Attack Classification',
      evidence: [
        { type: 'network', content: '45Gbps UDP flood traffic' },
        { type: 'application', content: '50,000 HTTP requests/second to checkout API' },
      ],
      suggestedClassification: 'malicious',
    },
    {
      id: 'find-002',
      title: 'Botnet Infrastructure',
      description: 'Attack originated from approximately 180,000 unique IPs suggesting large botnet',
      severity: 'high',
      confidence: 92,
      category: 'Threat Actor',
      evidence: [
        { type: 'network', content: '180,000 unique source IPs across 50+ countries' },
        { type: 'pattern', content: 'Known bulletproof hosting ASNs involved' },
      ],
      suggestedClassification: 'malicious',
    },
    {
      id: 'find-003',
      title: 'Targeted API Endpoint',
      description: 'Checkout API specifically targeted to maximize business impact',
      severity: 'critical',
      confidence: 95,
      category: 'Attack Intent',
      evidence: [
        { type: 'application', content: '/api/v2/checkout/process received 80% of attack traffic' },
        { type: 'timing', content: 'Attack timed for Black Friday peak shopping' },
      ],
      suggestedClassification: 'malicious',
    },
    {
      id: 'find-004',
      title: 'WAF in Detection Mode',
      description: 'AWS WAF was in COUNT (detection) mode, not actively blocking attacks',
      severity: 'high',
      confidence: 100,
      category: 'Security Gap',
      evidence: [
        { type: 'config', content: 'WAF rules set to COUNT instead of BLOCK' },
        { type: 'logs', content: '25,000 matches/min not blocked' },
      ],
      suggestedClassification: 'needs_investigation',
    },
    {
      id: 'find-005',
      title: 'Inadequate Rate Limiting',
      description: 'No rate limiting was in place before the attack started',
      severity: 'high',
      confidence: 95,
      category: 'Security Gap',
      evidence: [
        { type: 'config', content: 'Rate limiting had to be emergency-deployed during attack' },
        { type: 'baseline', content: 'No pre-configured DDoS protection for API endpoints' },
      ],
      suggestedClassification: 'needs_investigation',
    },
    {
      id: 'find-006',
      title: 'Auto-Scaling Cost Impact',
      description: 'Auto-scaling in response to attack traffic significantly increased infrastructure costs',
      severity: 'medium',
      confidence: 85,
      category: 'Incident Impact',
      evidence: [
        { type: 'infrastructure', content: 'Auto-scaled from 4 to 20 instances' },
        { type: 'cost', content: 'Estimated $15,000 in unplanned compute costs' },
      ],
      suggestedClassification: 'needs_investigation',
    },
  ],

  reportData: {
    executiveSummary: 'A coordinated multi-vector DDoS attack targeted the e-commerce platform during Black Friday, combining 45Gbps volumetric UDP flood with application-layer attacks on checkout APIs. The 8-hour attack caused severe service degradation, resulting in estimated $4.2M revenue loss. The attack originated from a botnet of approximately 180,000 IPs. Mitigation was delayed due to WAF being in detection-only mode.',
    businessImpact: {
      operational: 'high',
      financial: 'high',
      reputational: 'high',
      regulatory: 'low',
    },
    recommendations: [
      {
        priority: 'immediate',
        title: 'Enable WAF Block Mode',
        description: 'Switch AWS WAF from COUNT to BLOCK mode for DDoS-related rules.',
      },
      {
        priority: 'immediate',
        title: 'Implement API Rate Limiting',
        description: 'Deploy rate limiting on all API endpoints, especially checkout.',
      },
      {
        priority: 'immediate',
        title: 'Engage DDoS Mitigation Service',
        description: 'Contract with dedicated DDoS scrubbing service for always-on protection.',
      },
      {
        priority: 'short_term',
        title: 'Bot Management Solution',
        description: 'Deploy advanced bot management to distinguish legitimate users from bots.',
      },
      {
        priority: 'short_term',
        title: 'Geographic Restrictions',
        description: 'Implement geo-blocking for regions with no legitimate customers.',
      },
      {
        priority: 'short_term',
        title: 'Auto-Scaling Cost Controls',
        description: 'Implement maximum instance limits and spending alerts for auto-scaling.',
      },
      {
        priority: 'long_term',
        title: 'DDoS Response Playbook Update',
        description: 'Update runbook with lessons learned and faster escalation procedures.',
      },
      {
        priority: 'long_term',
        title: 'Regular DDoS Drills',
        description: 'Conduct quarterly DDoS simulation exercises to test response capabilities.',
      },
    ],
    gaps: [
      { category: 'DDoS Protection', current: 2, target: 5, gap: 'No always-on DDoS scrubbing, WAF in detection mode' },
      { category: 'API Security', current: 2, target: 5, gap: 'No rate limiting on critical endpoints' },
      { category: 'Bot Management', current: 1, target: 4, gap: 'Basic bot detection only' },
      { category: 'Incident Response', current: 2, target: 4, gap: 'Slow escalation, no pre-authorized mitigations' },
    ],
  },
};
