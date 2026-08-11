import type { VenuePreset } from '../../types/crowdflow';

// Sample CSV Strings directly from User Request
export const IPL_ZONES_CSV = `zone_id,name,type,x,y,area_m2,capacity_per_min,safe_density,critical_density
gate_a,Gate A,entry_gate,145,160,530,900,3.5,5.4
north_plaza,North Plaza,holding_area,450,88,620,980,3.5,5.4
gate_c,Gate C,entry_gate,756,164,470,900,3.5,5.4
food_court,Food Court,concession,660,430,430,540,3.2,5.0
south_exit,South Exit,emergency_exit,445,550,690,1100,3.0,5.0
metro_plaza,Metro Plaza,transit_exit,220,520,760,1250,3.2,5.2
lower_bowl,Lower Bowl Concourse,concourse,450,290,950,1400,3.0,5.2`;

export const IPL_CORRIDORS_CSV = `edge_id,from_zone,to_zone,width_m,length_m,capacity_per_min,bidirectional,status
e1,gate_a,north_plaza,7,82,900,true,open
e2,north_plaza,lower_bowl,8,110,980,true,open
e3,gate_c,lower_bowl,5,95,720,true,open
e4,gate_c,north_plaza,6,130,820,true,open
e5,food_court,lower_bowl,4,70,540,true,open
e6,south_exit,metro_plaza,9,150,1100,true,open
e7,gate_c,south_exit,5,210,650,false,emergency_only`;

export const IPL_SCHEDULE_CSV = `time,event,expected_behavior
18:30,Gates open,slow arrival starts
19:30,Peak arrival,high gate pressure
20:30,Gates close,last-minute rush
21:00,Match starts,concourse stabilizes
22:30,Interval,food court spike
23:30,Match ends,egress pressure`;

export const IPL_FORECAST_CSV = `time,crowd_expected,phase
18:30,12000,Ingress
19:00,26000,Ingress
19:30,42000,Ingress
20:00,52000,Ingress
20:30,61000,Ingress
21:00,65000,Live event
22:30,65000,Interval
23:30,65000,Egress`;

export const IPL_INCIDENTS_CSV = `time,zone,report_text,expected_label
19:48,gate_c,QR scanning is slow at Gate C,ticketing obstruction
20:05,north_plaza,People are confused near Section 114,wayfinding issue
22:34,food_court,Food court queue is spilling into main concourse,crowd congestion
23:38,south_exit,Medical team needs clear lane near south exit,medical incident
23:44,gate_c,Security team reports pushing near Gate C,security concern`;

export const IPL_ACTIONS_CSV = `time,action,zone,expected_effect
19:52,open_gate_b_relief_route,gate_c,reduce_gate_c_load
20:08,deploy_extra_stewards,north_plaza,improve_wayfinding
22:36,create_food_court_bypass,food_court,reduce_concession_queue
23:40,open_service_lane,south_exit,protect_emergency_lane`;

export const IPL_SENSOR_READINGS_CSV = `zone_id,timestamp,cctv_count,wifi_count,turnstile_count,flow_rate_in,flow_rate_out
gate_a,19:45:00,480,510,475,320,310
north_plaza,19:45:00,1450,1580,0,510,480
gate_c,19:45:00,2450,2620,2380,880,240
food_court,19:45:00,620,700,0,140,150
south_exit,19:45:00,210,240,0,40,45
metro_plaza,19:45:00,890,950,0,210,230
lower_bowl,19:45:00,3100,3350,0,720,680`;

export const PRESETS: Record<string, VenuePreset> = {
  ipl_stadium: {
    id: 'ipl_stadium',
    name: 'IPL Cricket Stadium (Narendra Modi / Wankhede)',
    subtitle: 'Capacity 65,000 | Match Ingress & Egress Surge Control',
    category: 'Stadium',
    location: 'Ahmedabad / Mumbai, India',
    capacity: 65000,
    zones: [
      { zone_id: 'gate_a', name: 'Gate A (West Entry)', type: 'entry_gate', x: 145, y: 160, area_m2: 530, capacity_per_min: 900, safe_density: 3.5, critical_density: 5.4 },
      { zone_id: 'north_plaza', name: 'North Plaza Hub', type: 'holding_area', x: 450, y: 88, area_m2: 620, capacity_per_min: 980, safe_density: 3.5, critical_density: 5.4 },
      { zone_id: 'gate_c', name: 'Gate C (East Turnstiles)', type: 'entry_gate', x: 756, y: 164, area_m2: 470, capacity_per_min: 900, safe_density: 3.5, critical_density: 5.4 },
      { zone_id: 'food_court', name: 'Food Court Concourse', type: 'concession', x: 660, y: 430, area_m2: 430, capacity_per_min: 540, safe_density: 3.2, critical_density: 5.0 },
      { zone_id: 'south_exit', name: 'South Exit Gate', type: 'emergency_exit', x: 445, y: 550, area_m2: 690, capacity_per_min: 1100, safe_density: 3.0, critical_density: 5.0 },
      { zone_id: 'metro_plaza', name: 'Metro Station Plaza', type: 'transit_exit', x: 220, y: 520, area_m2: 760, capacity_per_min: 1250, safe_density: 3.2, critical_density: 5.2 },
      { zone_id: 'lower_bowl', name: 'Lower Bowl Concourse', type: 'concourse', x: 450, y: 290, area_m2: 950, capacity_per_min: 1400, safe_density: 3.0, critical_density: 5.2 },
    ],
    corridors: [
      { edge_id: 'e1', from_zone: 'gate_a', to_zone: 'north_plaza', width_m: 7, length_m: 82, capacity_per_min: 900, bidirectional: true, status: 'open' },
      { edge_id: 'e2', from_zone: 'north_plaza', to_zone: 'lower_bowl', width_m: 8, length_m: 110, capacity_per_min: 980, bidirectional: true, status: 'open' },
      { edge_id: 'e3', from_zone: 'gate_c', to_zone: 'lower_bowl', width_m: 5, length_m: 95, capacity_per_min: 720, bidirectional: true, status: 'open' },
      { edge_id: 'e4', from_zone: 'gate_c', to_zone: 'north_plaza', width_m: 6, length_m: 130, capacity_per_min: 820, bidirectional: true, status: 'open' },
      { edge_id: 'e5', from_zone: 'food_court', to_zone: 'lower_bowl', width_m: 4, length_m: 70, capacity_per_min: 540, bidirectional: true, status: 'open' },
      { edge_id: 'e6', from_zone: 'south_exit', to_zone: 'metro_plaza', width_m: 9, length_m: 150, capacity_per_min: 1100, bidirectional: true, status: 'open' },
      { edge_id: 'e7', from_zone: 'gate_c', to_zone: 'south_exit', width_m: 5, length_m: 210, capacity_per_min: 650, bidirectional: false, status: 'emergency_only' },
    ],
    schedule: [
      { time: '18:30', event: 'Gates open', expected_behavior: 'slow arrival starts' },
      { time: '19:30', event: 'Peak arrival', expected_behavior: 'high gate pressure' },
      { time: '20:30', event: 'Gates close', expected_behavior: 'last-minute rush' },
      { time: '21:00', event: 'Match starts', expected_behavior: 'concourse stabilizes' },
      { time: '22:30', event: 'Interval', expected_behavior: 'food court spike' },
      { time: '23:30', event: 'Match ends', expected_behavior: 'egress pressure' },
    ],
    forecast: [
      { time: '18:30', crowd_expected: 12000, phase: 'Ingress' },
      { time: '19:00', crowd_expected: 26000, phase: 'Ingress' },
      { time: '19:30', crowd_expected: 42000, phase: 'Ingress' },
      { time: '20:00', crowd_expected: 52000, phase: 'Ingress' },
      { time: '20:30', crowd_expected: 61000, phase: 'Ingress' },
      { time: '21:00', crowd_expected: 65000, phase: 'Live event' },
      { time: '22:30', crowd_expected: 65000, phase: 'Interval' },
      { time: '23:30', crowd_expected: 65000, phase: 'Egress' },
    ],
    sampleIncidents: [
      {
        id: 'inc-1',
        time: '19:48',
        zone: 'gate_c',
        report_text: 'QR scanning is slow at Gate C',
        expected_label: 'ticketing obstruction',
        status: 'pending',
      },
      {
        id: 'inc-2',
        time: '20:05',
        zone: 'north_plaza',
        report_text: 'People are confused near Section 114',
        expected_label: 'wayfinding issue',
        status: 'pending',
      },
      {
        id: 'inc-3',
        time: '22:34',
        zone: 'food_court',
        report_text: 'Food court queue is spilling into main concourse',
        expected_label: 'crowd congestion',
        status: 'pending',
      },
    ],
    defaultStrategies: [
      {
        id: 'strat-1',
        title: 'Strategy 1: Open Gate B Relief Loop',
        description: 'Activate Corridor E7 (Emergency Gate C -> South Exit) and open Gate B overflow turnstiles to divert 35% of Gate C arrivals to North Plaza & South Exit.',
        target_zone: 'gate_c',
        modified_corridors: [
          { edge_id: 'e7', new_status: 'open', new_capacity: 1100 },
          { edge_id: 'e4', new_status: 'open', new_capacity: 1200 },
        ],
        risk_reduction_pct: 31,
        before_risk: 81,
        after_risk: 56,
        eta_improvement_mins: 6.5,
        capacity_relief_pmin: 480,
        stewards_required: 8,
        explanation: 'Diverts 480 fans/min from congested Gate C turnstiles directly into North Plaza holding buffer before critical threshold is breached.',
        is_recommended: true,
      },
      {
        id: 'strat-2',
        title: 'Strategy 2: Meter Gate C & Priority Family Bypass',
        description: 'Reduce Gate C intake batch size by 30s intervals while opening South Service Lane for family pass holders.',
        target_zone: 'gate_c',
        modified_corridors: [
          { edge_id: 'e3', new_status: 'restricted', new_capacity: 500 },
        ],
        risk_reduction_pct: 22,
        before_risk: 81,
        after_risk: 63,
        eta_improvement_mins: 3.2,
        capacity_relief_pmin: 260,
        stewards_required: 12,
        explanation: 'Smoothes incoming wave at Gate C but increases outer queue length in perimeter plaza.',
        is_recommended: false,
      },
      {
        id: 'strat-3',
        title: 'Strategy 3: Full Ingress Hold & Re-route to Gate A',
        description: 'Temporarily pause Gate C ticket validation and direct incoming crowd along outer perimeter to Gate A.',
        target_zone: 'gate_c',
        modified_corridors: [
          { edge_id: 'e3', new_status: 'closed', new_capacity: 0 },
        ],
        risk_reduction_pct: 15,
        before_risk: 81,
        after_risk: 69,
        eta_improvement_mins: -4.0,
        capacity_relief_pmin: 600,
        stewards_required: 20,
        explanation: 'Relieves Gate C immediately but causes surge backlog at Gate A within 12 minutes.',
        is_recommended: false,
      },
    ],
    rawCsvs: {
      venue_zones: IPL_ZONES_CSV,
      corridors: IPL_CORRIDORS_CSV,
      event_schedule: IPL_SCHEDULE_CSV,
      arrival_forecast: IPL_FORECAST_CSV,
      live_sensor_readings: IPL_SENSOR_READINGS_CSV,
      incident_reports: IPL_INCIDENTS_CSV,
      operator_actions: IPL_ACTIONS_CSV,
    },
  },
  kumbh_mela: {
    id: 'kumbh_mela',
    name: 'Kumbh Mela Prayagraj (Sangam Bathing Ghats)',
    subtitle: 'Capacity 2,500,000 | Shahi Snan Mass Egress & Pontoon Management',
    category: 'Pilgrimage',
    location: 'Prayagraj, Uttar Pradesh, India',
    capacity: 2500000,
    zones: [
      { zone_id: 'sangam_ghat_1', name: 'Main Sangam Bathing Ghat', type: 'holding_area', x: 500, y: 120, area_m2: 4500, capacity_per_min: 4500, safe_density: 3.0, critical_density: 4.8 },
      { zone_id: 'pontoon_3', name: 'Pontoon Bridge #3 (East)', type: 'concourse', x: 750, y: 280, area_m2: 850, capacity_per_min: 1200, safe_density: 2.5, critical_density: 4.2 },
      { zone_id: 'food_annakshetra', name: 'Annakshetra Food Tent', type: 'concession', x: 250, y: 350, area_m2: 2200, capacity_per_min: 1800, safe_density: 3.2, critical_density: 5.0 },
      { zone_id: 'processional_way', name: 'Akada Processional Way', type: 'concourse', x: 500, y: 380, area_m2: 3800, capacity_per_min: 3500, safe_density: 3.0, critical_density: 5.0 },
      { zone_id: 'tent_city_south', name: 'Sector 4 Pilgrim Camp', type: 'holding_area', x: 300, y: 550, area_m2: 6000, capacity_per_min: 5000, safe_density: 3.5, critical_density: 5.5 },
      { zone_id: 'railway_shuttle_hub', name: 'Special Shuttle Bus Terminus', type: 'transit_exit', x: 780, y: 520, area_m2: 3200, capacity_per_min: 3200, safe_density: 3.2, critical_density: 5.2 },
    ],
    corridors: [
      { edge_id: 'km1', from_zone: 'sangam_ghat_1', to_zone: 'pontoon_3', width_m: 6, length_m: 220, capacity_per_min: 1200, bidirectional: false, status: 'open' },
      { edge_id: 'km2', from_zone: 'sangam_ghat_1', to_zone: 'processional_way', width_m: 14, length_m: 310, capacity_per_min: 3500, bidirectional: true, status: 'open' },
      { edge_id: 'km3', from_zone: 'processional_way', to_zone: 'food_annakshetra', width_m: 8, length_m: 180, capacity_per_min: 1800, bidirectional: true, status: 'open' },
      { edge_id: 'km4', from_zone: 'processional_way', to_zone: 'tent_city_south', width_m: 12, length_m: 400, capacity_per_min: 3000, bidirectional: true, status: 'open' },
      { edge_id: 'km5', from_zone: 'pontoon_3', to_zone: 'railway_shuttle_hub', width_m: 7, length_m: 350, capacity_per_min: 1400, bidirectional: false, status: 'open' },
      { edge_id: 'km6', from_zone: 'sangam_ghat_1', to_zone: 'tent_city_south', width_m: 10, length_m: 600, capacity_per_min: 2200, bidirectional: false, status: 'emergency_only' },
    ],
    schedule: [
      { time: '03:00', event: 'Brahma Muhurta Snan Begins', expected_behavior: 'heavy surge towards riverfront' },
      { time: '06:00', event: 'Shahi Snan Procession', expected_behavior: 'Akada movement blocks central corridor' },
      { time: '09:00', event: 'Morning Bathing Peak', expected_behavior: 'pontoon bridges at 95% capacity' },
      { time: '12:00', event: 'Mass Egress to Food Tents', expected_behavior: 'high concession area density' },
    ],
    forecast: [
      { time: '03:00', crowd_expected: 400000, phase: 'Ingress' },
      { time: '06:00', crowd_expected: 1200000, phase: 'Ingress' },
      { time: '09:00', crowd_expected: 2100000, phase: 'Live event' },
      { time: '12:00', crowd_expected: 2400000, phase: 'Egress' },
    ],
    sampleIncidents: [
      {
        id: 'km-inc-1',
        time: '08:42',
        zone: 'pontoon_3',
        report_text: 'Pilgrims stopping to take photos on Pontoon Bridge 3, crowd building rapidly',
        expected_label: 'crowd congestion',
        status: 'pending',
      },
      {
        id: 'km-inc-2',
        time: '09:15',
        zone: 'sangam_ghat_1',
        report_text: 'Elderly pilgrim faint near riverbank edge, medical volunteers requesting passage',
        expected_label: 'medical incident',
        status: 'pending',
      },
    ],
    defaultStrategies: [
      {
        id: 'km-strat-1',
        title: 'Strategy 1: One-Way Pontoon Loop & Emergency Ring Bypass',
        description: 'Convert Pontoon Bridge 3 strictly to one-way exit, activate Emergency Bypass Corridor KM6 to Sector 4 Camp.',
        target_zone: 'pontoon_3',
        modified_corridors: [
          { edge_id: 'km6', new_status: 'open', new_capacity: 2200 },
          { edge_id: 'km1', new_status: 'open', new_capacity: 1800 },
        ],
        risk_reduction_pct: 38,
        before_risk: 86,
        after_risk: 53,
        eta_improvement_mins: 14.0,
        capacity_relief_pmin: 1200,
        stewards_required: 24,
        explanation: 'Eliminates counter-flow on narrow pontoon wooden decks and vents 1200 pilgrims/min safely to Sector 4 camp.',
        is_recommended: true,
      },
    ],
    rawCsvs: {
      venue_zones: `zone_id,name,type,x,y,area_m2,capacity_per_min,safe_density,critical_density\nsangam_ghat_1,Sangam Ghat,holding_area,500,120,4500,4500,3.0,4.8\npontoon_3,Pontoon Bridge 3,concourse,750,280,850,1200,2.5,4.2`,
      corridors: `edge_id,from_zone,to_zone,width_m,length_m,capacity_per_min,bidirectional,status\nkm1,sangam_ghat_1,pontoon_3,6,220,1200,false,open`,
      event_schedule: `time,event,expected_behavior\n03:00,Brahma Muhurta,surge towards riverfront`,
      arrival_forecast: `time,crowd_expected,phase\n03:00,400000,Ingress`,
      live_sensor_readings: `zone_id,timestamp,cctv_count,wifi_count,turnstile_count,flow_rate_in,flow_rate_out\npontoon_3,08:45:00,3100,3400,0,1150,720`,
      incident_reports: `time,zone,report_text,expected_label\n08:42,pontoon_3,Pilgrims stopping to take photos on Pontoon Bridge 3,crowd congestion`,
      operator_actions: `time,action,zone,expected_effect\n08:50,activate_one_way_pontoon_loop,pontoon_3,prevent_counterflow`,
    },
  },
  railway_hub: {
    id: 'railway_hub',
    name: 'Chhatrapati Shivaji Maharaj Terminus (CSMT Peak Hour)',
    subtitle: 'Capacity 180,000 / hr | Suburban Commuter Surge & FOB Junction Control',
    category: 'Transit',
    location: 'Mumbai, Maharashtra, India',
    capacity: 180000,
    zones: [
      { zone_id: 'plat_1_4', name: 'Platforms 1-4 Harbor Line', type: 'holding_area', x: 200, y: 150, area_m2: 1200, capacity_per_min: 2400, safe_density: 3.2, critical_density: 5.2 },
      { zone_id: 'fob_north', name: 'Foot Overbridge North Junction', type: 'concourse', x: 480, y: 220, area_m2: 450, capacity_per_min: 850, safe_density: 2.8, critical_density: 4.8 },
      { zone_id: 'escalator_bank_2', name: 'Escalator Bank #2 (Subway)', type: 'concourse', x: 720, y: 310, area_m2: 320, capacity_per_min: 600, safe_density: 2.5, critical_density: 4.5 },
      { zone_id: 'concourse_main', name: 'Central Ticket Concourse', type: 'holding_area', x: 480, y: 420, area_m2: 1800, capacity_per_min: 3200, safe_density: 3.2, critical_density: 5.0 },
      { zone_id: 'subway_passage', name: 'Subway Passage to Metro Line 3', type: 'transit_exit', x: 250, y: 520, area_m2: 890, capacity_per_min: 1500, safe_density: 3.0, critical_density: 5.0 },
      { zone_id: 'exit_gate_d', name: 'DN Road Main Exit Gate D', type: 'emergency_exit', x: 750, y: 530, area_m2: 950, capacity_per_min: 2100, safe_density: 3.2, critical_density: 5.2 },
    ],
    corridors: [
      { edge_id: 'rw1', from_zone: 'plat_1_4', to_zone: 'fob_north', width_m: 5, length_m: 60, capacity_per_min: 850, bidirectional: true, status: 'open' },
      { edge_id: 'rw2', from_zone: 'fob_north', to_zone: 'escalator_bank_2', width_m: 4, length_m: 85, capacity_per_min: 600, bidirectional: true, status: 'open' },
      { edge_id: 'rw3', from_zone: 'fob_north', to_zone: 'concourse_main', width_m: 7, length_m: 75, capacity_per_min: 1400, bidirectional: true, status: 'open' },
      { edge_id: 'rw4', from_zone: 'concourse_main', to_zone: 'subway_passage', width_m: 6, length_m: 110, capacity_per_min: 1200, bidirectional: true, status: 'open' },
      { edge_id: 'rw5', from_zone: 'concourse_main', to_zone: 'exit_gate_d', width_m: 8, length_m: 90, capacity_per_min: 1800, bidirectional: true, status: 'open' },
      { edge_id: 'rw6', from_zone: 'fob_north', to_zone: 'exit_gate_d', width_m: 5, length_m: 140, capacity_per_min: 750, bidirectional: false, status: 'emergency_only' },
    ],
    schedule: [
      { time: '08:30', event: 'Morning Commuter Peak Begins', expected_behavior: 'train arrival every 3 minutes' },
      { time: '09:15', event: 'Super Fast Express Arrival', expected_behavior: 'concourse cross-flow peak' },
      { time: '18:00', event: 'Evening Egress Peak', expected_behavior: 'heavy staircase bottleneck' },
    ],
    forecast: [
      { time: '08:30', crowd_expected: 45000, phase: 'Ingress' },
      { time: '09:00', crowd_expected: 95000, phase: 'Ingress' },
      { time: '09:30', crowd_expected: 110000, phase: 'Live event' },
    ],
    sampleIncidents: [
      {
        id: 'rw-inc-1',
        time: '09:02',
        zone: 'escalator_bank_2',
        report_text: 'Escalator #2 stopped unexpectedly, commuters building up at top landing',
        expected_label: 'ticketing obstruction',
        status: 'pending',
      },
    ],
    defaultStrategies: [
      {
        id: 'rw-strat-1',
        title: 'Strategy 1: Divert FOB Passengers to Direct Ramp Exit',
        description: 'Open emergency stairs RW6 directly to Gate D and set Escalator Bank #2 stairs to one-way descent.',
        target_zone: 'escalator_bank_2',
        modified_corridors: [
          { edge_id: 'rw6', new_status: 'open', new_capacity: 1100 },
          { edge_id: 'rw2', new_status: 'restricted', new_capacity: 400 },
        ],
        risk_reduction_pct: 35,
        before_risk: 84,
        after_risk: 54,
        eta_improvement_mins: 5.0,
        capacity_relief_pmin: 700,
        stewards_required: 6,
        explanation: 'Prevents crushing at top of halted escalator landing by routing 700 commuters/min onto wide exterior emergency stairs.',
        is_recommended: true,
      },
    ],
    rawCsvs: {
      venue_zones: `zone_id,name,type,x,y,area_m2,capacity_per_min,safe_density,critical_density\nplat_1_4,Platforms 1-4,holding_area,200,150,1200,2400,3.2,5.2`,
      corridors: `edge_id,from_zone,to_zone,width_m,length_m,capacity_per_min,bidirectional,status\nrw1,plat_1_4,fob_north,5,60,850,true,open`,
      event_schedule: `time,event,expected_behavior\n08:30,Morning Peak,3-min train frequency`,
      arrival_forecast: `time,crowd_expected,phase\n08:30,45000,Ingress`,
      live_sensor_readings: `zone_id,timestamp,cctv_count,wifi_count,turnstile_count,flow_rate_in,flow_rate_out\nescalator_bank_2,09:02:00,1200,1400,0,550,120`,
      incident_reports: `time,zone,report_text,expected_label\n09:02,escalator_bank_2,Escalator #2 stopped unexpectedly,ticketing obstruction`,
      operator_actions: `time,action,zone,expected_effect\n09:05,open_direct_ramp_exit,escalator_bank_2,relieve_escalator_landing`,
    },
  },
  airport_t3: {
    id: 'airport_t3',
    name: 'Indira Gandhi International Airport (Terminal 3)',
    subtitle: 'Capacity 90,000 / day | International Departure Security Peak',
    category: 'Airport',
    location: 'New Delhi, India',
    capacity: 90000,
    zones: [
      { zone_id: 'checkin_hall_a', name: 'Check-in Counter Zone A-D', type: 'holding_area', x: 200, y: 180, area_m2: 2400, capacity_per_min: 1500, safe_density: 2.8, critical_density: 4.5 },
      { zone_id: 'security_hall_central', name: 'Central Security Check Hall', type: 'entry_gate', x: 500, y: 220, area_m2: 1800, capacity_per_min: 1200, safe_density: 3.0, critical_density: 4.8 },
      { zone_id: 'immigration_zone', name: 'International Immigration Hall', type: 'concourse', x: 750, y: 250, area_m2: 1500, capacity_per_min: 1100, safe_density: 3.0, critical_density: 4.8 },
      { zone_id: 'duty_free_plaza', name: 'Duty Free Central Node', type: 'concession', x: 600, y: 420, area_m2: 3200, capacity_per_min: 2200, safe_density: 3.2, critical_density: 5.0 },
      { zone_id: 'pier_b_gates', name: 'Departure Pier B (Gates 15-26)', type: 'transit_exit', x: 300, y: 530, area_m2: 2800, capacity_per_min: 1800, safe_density: 3.0, critical_density: 5.0 },
      { zone_id: 'fast_track_security', name: 'Fast Track & Airside Bypass', type: 'entry_gate', x: 800, y: 480, area_m2: 950, capacity_per_min: 900, safe_density: 2.8, critical_density: 4.6 },
    ],
    corridors: [
      { edge_id: 'ap1', from_zone: 'checkin_hall_a', to_zone: 'security_hall_central', width_m: 8, length_m: 90, capacity_per_min: 1400, bidirectional: false, status: 'open' },
      { edge_id: 'ap2', from_zone: 'security_hall_central', to_zone: 'immigration_zone', width_m: 7, length_m: 65, capacity_per_min: 1100, bidirectional: false, status: 'open' },
      { edge_id: 'ap3', from_zone: 'immigration_zone', to_zone: 'duty_free_plaza', width_m: 10, length_m: 110, capacity_per_min: 2000, bidirectional: true, status: 'open' },
      { edge_id: 'ap4', from_zone: 'duty_free_plaza', to_zone: 'pier_b_gates', width_m: 8, length_m: 180, capacity_per_min: 1600, bidirectional: true, status: 'open' },
      { edge_id: 'ap5', from_zone: 'checkin_hall_a', to_zone: 'fast_track_security', width_m: 6, length_m: 140, capacity_per_min: 900, bidirectional: false, status: 'restricted' },
    ],
    schedule: [
      { time: '22:00', event: 'Late Night International Wave', expected_behavior: 'long security queues' },
      { time: '01:00', event: 'European Flight Departures', expected_behavior: 'boarding gate peak' },
    ],
    forecast: [
      { time: '22:00', crowd_expected: 18000, phase: 'Ingress' },
      { time: '00:00', crowd_expected: 32000, phase: 'Live event' },
    ],
    sampleIncidents: [
      {
        id: 'ap-inc-1',
        time: '22:45',
        zone: 'security_hall_central',
        report_text: 'Two X-ray machines down in central security lane, queue tailing into main hall',
        expected_label: 'ticketing obstruction',
        status: 'pending',
      },
    ],
    defaultStrategies: [
      {
        id: 'ap-strat-1',
        title: 'Strategy 1: Open Fast-Track Channel for Pier B Passengers',
        description: 'Convert Fast-Track Channel AP5 to open status for standard boarding passes to relieve Central Security Hall.',
        target_zone: 'security_hall_central',
        modified_corridors: [
          { edge_id: 'ap5', new_status: 'open', new_capacity: 1100 },
        ],
        risk_reduction_pct: 32,
        before_risk: 79,
        after_risk: 54,
        eta_improvement_mins: 8.5,
        capacity_relief_pmin: 450,
        stewards_required: 4,
        explanation: 'Redirects 450 passengers/min through unutilized Fast-Track screening lanes, cutting security wait times in half.',
        is_recommended: true,
      },
    ],
    rawCsvs: {
      venue_zones: `zone_id,name,type,x,y,area_m2,capacity_per_min,safe_density,critical_density\nsecurity_hall_central,Central Security,entry_gate,500,220,1800,1200,3.0,4.8`,
      corridors: `edge_id,from_zone,to_zone,width_m,length_m,capacity_per_min,bidirectional,status\nap1,checkin_hall_a,security_hall_central,8,90,1400,false,open`,
      event_schedule: `time,event,expected_behavior\n22:00,International Wave,long security queues`,
      arrival_forecast: `time,crowd_expected,phase\n22:00,18000,Ingress`,
      live_sensor_readings: `zone_id,timestamp,cctv_count,wifi_count,turnstile_count,flow_rate_in,flow_rate_out\nsecurity_hall_central,22:45:00,1650,1800,1400,750,320`,
      incident_reports: `time,zone,report_text,expected_label\n22:45,security_hall_central,Two X-ray machines down in central security lane,ticketing obstruction`,
      operator_actions: `time,action,zone,expected_effect\n22:50,open_fast_track_channel,security_hall_central,relieve_security_wait_time`,
    },
  },
};
