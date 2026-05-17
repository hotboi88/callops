// Home Relief campaign — VERIFIED seed data (v6 — all appt dates resolved to ISO)
// 365 leads · Mar 23 – May 14, 2026
// Client product: ADU, JADU, Garage Conversions, Room Additions
// Rates: IA=$15, Confirmed=$0, Transfer=$0, IA tier-2=$40, IA tier-3=$75
// Cross-verified against both Home Relief Leads and BW ADU chats.
// LATEST status wins — leads initially confirmed/IA but later DNC'd show as DNC.
// Status: pending 89 · transfer 139 · ia 35 · confirmed 34 · dnc 68
// Appointment dates: 358 ISO format, 6 empty (had invalid/missing data in original templates)

(function () {
  const TODAY = new Date(2026, 4, 15);
  function dayStr(d) {
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + dd;
  }
  let _uid = 1; const uid = () => "id_" + (_uid++);

  const campaign = {
    id: "cmp_home_relief",
    name: "Home Relief",
    client: "ADU, JADU, Garage Conversions, Room Additions",
    mark: "HR",
    rate_transfer: 0,
    rate_confirmed: 0,
    rate_ia: 15,
    ia_tier_2: 40,
    ia_tier_3: 75,
    created_at: "2026-03-20",
  };

  const AGENT_DEFS = [
    ["Arlene"                    , true , null                  , "active"],
    ["China (Stephany)"          , true , null                  , "active"],
    ["Rein"                      , false, "China (Stephany)"    , "active"],
    ["Jennifer Alobin"           , false, "China (Stephany)"    , "active"],
    ["Rhen"                      , false, "China (Stephany)"    , "active"],
    ["Mac"                       , false, "China (Stephany)"    , "active"],
    ["Gerene"                    , false, "Arlene"              , "active"],
    ["Aiza"                      , false, null                  , "active"],
    ["Jarelene"                  , false, null                  , "active"],
    ["Jhen"                      , false, null                  , "active"],
    ["Sharon"                    , false, null                  , "active"],
    ["Richelle"                  , false, null                  , "active"],
    ["Dianne"                    , false, null                  , "active"],
    ["Emil"                      , false, null                  , "active"],
    ["Ivy"                       , false, null                  , "active"],
    ["Ruel"                      , false, null                  , "active"],
    ["Nikita"                    , false, null                  , "active"],
    ["Irene"                     , false, null                  , "active"],
    ["Benica"                    , false, null                  , "active"],
    ["Jha/Allan"                 , false, null                  , "active"],
    ["Liz"                       , false, null                  , "active"],
    ["Keith"                     , false, null                  , "active"],
    ["Kemberly"                  , false, null                  , "active"],
    ["Jomar"                     , false, null                  , "active"],
    ["Divine Grace"              , false, null                  , "active"],
    ["Ana M"                     , false, null                  , "active"],
    ["Aubrey"                    , false, null                  , "active"],
    ["Larabell"                  , false, null                  , "active"],
    ["Marites"                   , false, null                  , "active"],
    ["Monica"                    , false, null                  , "active"],
    ["Ryan"                      , false, null                  , "active"],
    ["Lily/Shery"                , false, null                  , "active"],
    // Everyone else who passed through the attendance WhatsApp group — agents
    // who logged no leads (short tenures, never-worked-out hires). Names are the
    // raw WhatsApp handles; rename in the roster as needed.
    ["Nick", false, null, "active"],
    ["Y0ng", false, null, "active"],
    ["Sara May A. Enciso", false, null, "active"],
    ["prescillgb", false, null, "active"],
    ["Tanya", false, null, "active"],
    ["Enrique T. Uyanguren", false, null, "active"],
    ["Jonalyn Buyagon", false, null, "active"],
    ["Sy Bby", false, null, "active"],
    ["chin", false, null, "active"],
    ["Ruby Lyn", false, null, "active"],
    ["San", false, null, "active"],
    ["Shin", false, null, "active"],
    ["Allan Christopher Atienza", false, null, "active"],
    ["Alfe Dela Peña", false, null, "active"],
    ["AL", false, null, "active"],
    ["Angela", false, null, "active"],
    ["Renz manalo", false, null, "active"],
    ["Jesril Aguiran", false, null, "active"],
    ["Arlene Dayrit104", false, null, "active"],
    ["Fanie", false, null, "active"],
    ["Richelle Relife", false, null, "active"],
    ["Bry", false, null, "active"],
    ["🌻🌻🌻", false, null, "active"],
    ["John Ryan Pagunsan", false, null, "active"],
    ["Andrea", false, null, "active"],
    ["Faye Raner", false, null, "active"],
    ["Guen Guerrero", false, null, "active"],
    ["leadstrat eevecera", false, null, "active"],
    ["Arlen", false, null, "active"],
    ["talia500226", false, null, "active"],
    ["Halaena Faith", false, null, "active"],
    ["wengflakes", false, null, "active"],
    ["markblanco2023", false, null, "active"],
    ["Charvz", false, null, "active"],
    ["rjulito1102", false, null, "active"],
    ["norhana liwalug", false, null, "active"],
    ["Je Lay", false, null, "active"],
    ["Nikky Boy", false, null, "active"],
    ["Fairy Rose P Salaya", false, null, "active"],
    ["Tyrrie", false, null, "active"],
    ["Roxanne Campana", false, null, "active"],
    ["John marc Tumlos", false, null, "active"],
    ["Ariz", false, null, "active"],
    ["Jhona Lim", false, null, "active"],
    ["Mark Andrew De la Cruz", false, null, "active"],
    ["Paul", false, null, "active"],
    ["Myrra ligsay", false, null, "active"],
  ];

  function resolveName(name) { return name; }

  // From the "Home Relief" attendance WhatsApp chat (the agents' group).
  // Start = explicit "added/joined" marker, else first message (first attendance).
  // Termination = explicit "removed/left" marker. Benica & Ryan never posted in
  // either chat — start = first lead date.
  const START = {
    "Arlene": "2026-03-12", "China (Stephany)": "2026-03-24", "Rein": "2026-03-12",
    "Jennifer Alobin": "2026-03-12", "Rhen": "2026-04-06", "Mac": "2026-04-20",
    "Gerene": "2026-03-20", "Aiza": "2026-04-10", "Jarelene": "2026-04-06",
    "Jhen": "2026-04-06", "Sharon": "2026-03-17", "Richelle": "2026-03-25",
    "Dianne": "2026-03-27", "Emil": "2026-04-27", "Ivy": "2026-04-20",
    "Ruel": "2026-03-22", "Nikita": "2026-04-10", "Irene": "2026-03-27",
    "Benica": "2026-04-09", "Jha/Allan": "2026-03-31", "Liz": "2026-04-07",
    "Keith": "2026-04-27", "Kemberly": "2026-04-06", "Jomar": "2026-04-10",
    "Divine Grace": "2026-03-25", "Ana M": "2026-03-27", "Aubrey": "2026-04-06",
    "Larabell": "2026-03-12", "Marites": "2026-04-27", "Monica": "2026-04-27",
    "Ryan": "2026-04-13", "Lily/Shery": "2026-03-31",
    "Nick": "2026-03-12", "Y0ng": "2026-03-12", "Sara May A. Enciso": "2026-03-12",
    "prescillgb": "2026-03-12", "Tanya": "2026-03-12", "Enrique T. Uyanguren": "2026-03-12",
    "Jonalyn Buyagon": "2026-03-12", "Sy Bby": "2026-03-13", "chin": "2026-03-20",
    "Ruby Lyn": "2026-03-20", "San": "2026-03-21", "Shin": "2026-03-25",
    "Allan Christopher Atienza": "2026-03-27", "Alfe Dela Peña": "2026-03-27",
    "AL": "2026-03-30", "Angela": "2026-03-30", "Renz manalo": "2026-03-31",
    "Jesril Aguiran": "2026-03-31", "Arlene Dayrit104": "2026-03-31", "Fanie": "2026-03-31",
    "Richelle Relife": "2026-03-31", "Bry": "2026-04-06", "🌻🌻🌻": "2026-04-06",
    "John Ryan Pagunsan": "2026-04-06", "Andrea": "2026-04-10", "Faye Raner": "2026-04-10",
    "Guen Guerrero": "2026-04-10", "leadstrat eevecera": "2026-04-20", "Arlen": "2026-04-20",
    "talia500226": "2026-04-21", "Halaena Faith": "2026-04-21", "wengflakes": "2026-04-21",
    "markblanco2023": "2026-04-27", "Charvz": "2026-04-27",
    "rjulito1102": "2026-04-27", "norhana liwalug": "2026-04-27", "Je Lay": "2026-05-08",
    "Nikky Boy": "2026-05-08", "Fairy Rose P Salaya": "2026-05-08", "Tyrrie": "2026-05-11",
    "Roxanne Campana": "2026-05-11", "John marc Tumlos": "2026-05-11", "Ariz": "2026-05-11",
    "Jhona Lim": "2026-05-11", "Mark Andrew De la Cruz": "2026-05-15", "Paul": "2026-05-15",
    "Myrra ligsay": "2026-05-15",
  };
  const TERMINATED = {
    "Sharon": "2026-04-20", "Richelle": "2026-04-07", "Dianne": "2026-04-07",
    "Emil": "2026-05-08", "Ruel": "2026-04-20", "Jha/Allan": "2026-04-07",
    "Liz": "2026-04-17", "Keith": "2026-04-29", "Kemberly": "2026-04-25",
    "Jomar": "2026-04-17", "Aubrey": "2026-04-06", "Larabell": "2026-03-30",
    "Marites": "2026-04-29", "Monica": "2026-04-29", "Lily/Shery": "2026-05-08",
    "Divine Grace": "2026-03-30", "Ana M": "2026-03-30",
    "Nick": "2026-03-23", "Y0ng": "2026-03-25", "Sara May A. Enciso": "2026-03-25",
    "prescillgb": "2026-03-25", "Tanya": "2026-03-30", "Enrique T. Uyanguren": "2026-04-06",
    "Jonalyn Buyagon": "2026-03-23", "Sy Bby": "2026-03-23", "chin": "2026-03-24",
    "Ruby Lyn": "2026-03-28", "San": "2026-03-25", "Shin": "2026-03-30",
    "Allan Christopher Atienza": "2026-03-28", "Alfe Dela Peña": "2026-03-30",
    "AL": "2026-04-06", "Angela": "2026-03-31", "Renz manalo": "2026-04-07",
    "Jesril Aguiran": "2026-04-09", "Arlene Dayrit104": "2026-04-06", "Fanie": "2026-03-31",
    "Richelle Relife": "2026-04-07", "Bry": "2026-04-07", "🌻🌻🌻": "2026-04-23",
    "John Ryan Pagunsan": "2026-04-07", "Andrea": "2026-04-16", "Faye Raner": "2026-04-16",
    "Guen Guerrero": "2026-04-17", "leadstrat eevecera": "2026-04-23", "Arlen": "2026-04-29",
    "talia500226": "2026-04-23", "Halaena Faith": "2026-04-23", "wengflakes": "2026-04-23",
    "markblanco2023": "2026-04-29", "Charvz": "2026-04-27",
    "rjulito1102": "2026-04-29", "norhana liwalug": "2026-04-29", "Nikky Boy": "2026-05-11",
    "Fairy Rose P Salaya": "2026-05-16", "Tyrrie": "2026-05-11", "Roxanne Campana": "2026-05-16",
    "John marc Tumlos": "2026-05-14", "Ariz": "2026-05-15", "Jhona Lim": "2026-05-11",
    "Mark Andrew De la Cruz": "2026-05-15", "Paul": "2026-05-15",
  };

  const nameToAgent = {};
  const agents = AGENT_DEFS.map(([name, is_tl, _tl, status], i) => {
    const a = {
      id: "ag_" + i,
      campaign_id: campaign.id,
      full_name: name,
      agent_number: "A" + (1001 + i),
      status: TERMINATED[name] ? "inactive" : status,
      is_tl,
      date_added: START[name] || "2026-03-20",
      date_removed: TERMINATED[name] || null,
    };
    nameToAgent[name] = a;
    return a;
  });
  agents.forEach((a, i) => {
    const [, , tlName] = AGENT_DEFS[i];
    a.assigned_tl_id = tlName ? nameToAgent[tlName]?.id || null : null;
  });

  // Format: date | time | agent | customer | phone | address | project | appt_date | appt_time | status | client$ | spiff | tl_bonus | tl_recipient | remarks
  const LEADS_RAW = `
2026-03-23 | 09:30 | Rein | Kyler Sawicki | (805) 443-0282 | 1787 Ridgewood Dr, Camarillo, CA 93012 | Additional Space (No Garage) | 2026-03-23 | 11:00 AM (PST) | transfer | 0 | 0 | 0 | — | Customer is the decision-maker.
2026-03-23 | 15:51 | Gerene | Barbara Baumann | (909) 989-3035 | 10993 Wilderness Dr, Rancho Cucamonga, CA 91737 | ADU (Half Acre Land) | 2026-03-27 | 10:00 AM (PST) | transfer | 0 | 0 | 0 | — | Customer is the decision-maker. / Interested in building an ADU for additional privacy on her half-acre property.
2026-03-24 | 10:17 | Arlene | Allen Fairchild | (626) 437-0898 | 4138 Richwood Ave, El Monte, CA 91732 | ADU (Secondary Unit – Backyard) | 2026-03-24 | 1:00 PM (PST) | dnc | 0 | 0 | 0 | — | Customer is the decision-maker. / Customer’s wife will also be present during the appointment.
2026-03-24 | 13:05 | Rein | EDWARD MANDERS | (626) 278-1263 | 2865 Foss Ave Arcadia Va 92377 |  | 2026-03-30 | 13:00 | transfer | 0 | 0 | 0 | — | need to speak to her wife / Customer is the decision-maker
2026-03-25 | 10:00 | China (Stephany) | Angela Sharbino |  |  |  | 2026-03-25 |  | ia | 15 | 5 | 0 | — | Manually added — confirmed in chat, no original template
2026-03-25 | 10:09 | Divine Grace | Alexander Echeverry | (562) 250-6167 | 6611 11th Avenue, Los Angeles, CA 90043 (provided) | Appointment Date: March 26,2026 | 2026-03-26 | 11:00 | transfer | 0 | 0 | 0 | — |
2026-03-25 | 12:51 | Sharon | Luis Hernandez | (909) 910-2912 | 1557 N PERSHING AVE |  | 2026-03-25 | 5 PM (PST) | transfer | 0 | 0 | 0 | — | Customer is the decision-maker.
2026-03-25 | 14:26 | Ruel | Maria / Cesar Garcia | (818) 764-0597 | 7502 Denny Ave, Sun Valley, CA 91352 |  | 2026-03-25 | 6:00 PM (PST) | ia | 15 | 5 | 0 | — | Spoke with Mrs. Garcia and confirmed availability for a visit at 6:00 PM. / Husband is expected to be present at home. / Call was transferred to Alex for confirmation.
2026-03-25 | 16:31 | Ruel | Jervey Tervalon | (626) 827-5491 | 55 W Manor St, Altadena, CA 91001 |  | 2026-03-26 | 2:00 PM (PST) | transfer | 0 | 0 | 0 | — | Customer and his wife are interested in an ADU project. / Attempted to transfer the call, but another person answered and was not aware of the situation. / Call was disconnected during the transfer pr
2026-03-25 | 16:32 | Gerene | NOE CRUZ | (818) 516-5879 | 8360 Kester Ave Panorama City CA 91402 |  | 2026-03-25 | 18:00 | transfer | 0 | 0 | 0 | — | CX IS INTERESTED OF HAVING ADU ALREADY SET APPOINTMENT TODAY  / CX IS NOT ON THE ADDRESS RIGHT NOW
2026-03-25 | 17:33 | China (Stephany) | joe huzman | (562) 761-3124 | 5634 MESAGROVE AVE |  | 2026-03-26 | 17:00 | pending | 0 | 0 | 0 | — | cx interested in adu, agreed for appt tomorrow after 5pm
2026-03-26 | 09:13 | Rein | KENNETH SPOLOWITZ | (213) 505-8693 | 10520 Mary Ave Los Angeles CA 90002 |  | 2026-03-27 | 18:00 | confirmed | 0 | 10 | 0 | — | already have one  5 yrs ago but wants to get another wife is also a decision maker but she is avail like 7 in the evening  / Customer is the decision-maker
2026-03-26 | 09:30 | Arlene | Juan Cruz | (323) 481-7379 | 1408 E 76th Pl Los Angeles CA 90001 |  | 2026-03-26 | 15:00 | ia | 15 | 5 | 0 | — | he is interested in adding a garage  but speak small Engkish , he speaks espanol , he is the decision maker and agrred for a visit today at 3pm
2026-03-26 | 10:33 | Arlene | CAROLYN PEARSON | (562) 417-9107 | 15421 STEVENS AVENUE BELLFLOWER  CA 90706 |  | 2026-03-26 | 14:00 | transfer | 0 | 0 | 0 | — | she is interested on how much she can get , she is the decision maker and agreed for a visit today at 2pm not later than 2 pm- call her back because the call got disconnected but successfully transfer
2026-03-26 | 10:39 | Gerene | Robert | (442) 417-7166 | 1141 Noreen Ct, Upland, CA 91784 |  | 2026-03-26 | 1:00 PM (PST) | transfer | 0 | 0 | 0 | — | Customer does not want the garage to be modified; explained that construction can be done on top of the garage.
2026-03-26 | 12:26 | China (Stephany) | John Vigilan | (323) 855-9459 | 3801 Sutro Ave, Los Angeles, CA 90008 |  | 2026-03-26 | 18:00 | pending | 0 | 0 | 0 | — | cx interested in garage convertion// asked for a cb
2026-03-26 | 12:27 | Arlene | MR.ZIMMERMAN | (818) 324-0932 | 22393 Cass Ave Woodland Hls  CA 91364 |  |  | : | transfer | 0 | 0 | 0 | — | wants to transfer first before confirming the time of appt today
2026-03-26 | 12:54 | Gerene | CHARLIE JAY | (714) 878-8642 | 2867 La Vista Ave, Corona, CA 92879 |  | 2026-03-26 | 15:00 | transfer | 0 | 0 | 0 | — |
2026-03-27 | 10:12 | China (Stephany) | bomberreli | (310) 328-9261 | 20951 Brighton Ave, Torrance, CA 90501 |  | 2026-03-27 |  | transfer | 0 | 0 | 0 | — | vomberreli / _transferring_
2026-03-27 | 12:33 | Ana M | SYLVIA PACHECO | (562) 332-3447 | 9121 BLUFORD AVE |  | 2026-03-27 | -2PM | transfer | 0 | 0 | 0 | — | lead dont want to be transferred and just want to have an appointment at 2pm and said that she will just wait for the assessor
2026-03-27 | 14:26 | China (Stephany) | KONRAD HREHOROWICZ | (310) 463-8094 | 1224 E Villa St, Pasadena, CA 91106 |  | 2026-03-27 |  | pending | 0 | 0 | 0 | — |
2026-03-27 | 18:02 | Jha/Allan | Carlos Garcia/Linda Garcia | (978) 815-4880 | 1813 VALONA DR BALDWIN PARK CA 91706 |  | 2026-03-30 | - 2 PM in the afternoon | dnc | 0 | 0 | 0 | — | homeowner and decision maker i spoke with the husband Mr Carlos Garcia
2026-03-30 | 09:47 | Jennifer Alobin | Shahla Makaabi | (310) 871-1175 | 13532 Beverly Blvd   WHITTIER CA  90601 | adu back of her house | 2026-03-30 | 12:00 | transfer | 0 | 0 | 0 | — | cx wants to ask something coz she recieved money from the gov.for adu but she havent spoke to anyone yet she wanted to speak to a specialist first
2026-03-30 | 11:06 | Jennifer Alobin | Amanda Jordan | (424) 221-4495 | 4606 Olanda St 4606 Olanda St lyndon CA 90262 | JADU | 2026-04-03 | 14:00 | transfer | 0 | 0 | 0 | — | still cant xfer cx but advice her that she will recieve a call from our confirmer she is the sole HO
2026-03-30 | 12:17 | China (Stephany) | ROSEMARIE FOTI | (310) 218-9661 | 20951 Brighton Ave, TORRANCE, CA 90501 |  | 2026-03-30 | 17:00 | transfer | 0 | 0 | 0 | — | Customer mentioned they are currently waiting for permits to get started. / Advised that we can assist and help make the process easier / couldn't transfer
2026-03-30 | 14:41 | China (Stephany) | DENNIS SENYONJO | (818) 602-6123 | 25611 Palma Alta Dr, Valencia, CA 91354 |  | 2026-03-30 |  | transfer | 0 | 0 | 0 | — |
2026-03-30 | 16:01 | Arlene | Johanna Prewett | (951) 858-7653 | 3906 York Blvd  LOS ANGELES CA 90065 |  | 2026-03-31 | 17:00 | pending | 0 | 0 | 0 | — | interested, agreed  for tomorrow appointment , please call back - transfer line not working
2026-03-30 | 16:30 | Gerene | Damazo Soriano | (310) 293-2545 | 945 E 54Th St LOS ANGELES CA 90011 |  | 2026-03-31 | REMARKS: | transfer | 0 | 0 | 0 | — | cx interested with ADU want further info educated to call him back tomorrow for our specialist to assist him
2026-03-30 | 16:44 | Arlene | Timothy Darsarran | (562) 201-0136 | 13903 Walnut St,  WHITTIER 90602 |  | 2026-03-31 | 1;30 PM | pending | 0 | 0 | 0 | — | agreed for an appt tomorrow afternoon at 1:30 pm - please call back  - Thank you
2026-03-30 | 17:33 | Rein | JAVIER SIXTO | (323) 617-6845 | 2607 E 131ST ST, COMPTON, CA 90222 |  | 2026-03-31 | 09:30 | pending | 0 | 0 | 0 | — | he wants to know how much it will cost for ADU painting and roofing pls leave a message if no ones answer. / Customer is the decision-maker (speaks english and spanish, but said spanish is much better
2026-03-31 | 10:00 | Arlene | Donna |  |  |  | 2026-03-31 |  | ia | 15 | 5 | 0 | — | Manually added — confirmed in chat, no original template
2026-03-31 | 11:30 | Jha/Allan | Salvatorie Viola | (818) 963-1621 | 9301 SWINTON AVE NORTH HILLS CA 91343 |  | 2026-03-31 | 13:00 | dnc | 0 | 0 | 0 | — | Customer is the decision-maker
2026-03-31 | 11:42 | Jha/Allan | Hugh Rodriguez | (714) 499-1570 | cant provide address but interested |  | 2026-03-31 | 13:00 | transfer | 0 | 0 | 0 | — |
2026-03-31 | 12:40 | Arlene | DAVID | (469) 855-8788 | 1331 HIGHLAND AVE  GLENDALE  CA 91202 |  | 2026-03-31 | 17:00 | transfer | 0 | 0 | 0 | — | confirm
2026-03-31 | 15:18 | China (Stephany) | GERARDO- DELUERA | (818) 403-1869 | 13507 rayben st, SYLMAR, CA 91342 |  | 2026-03-31 |  | ia | 15 | 10 | 0 | — |
2026-03-31 | 17:55 | Lily/Shery | BRITTANY PRYOR | (323) 770-8247 | 1220 E 87TH ST, LOS ANGELES, CA 90002 |  | 2026-04-01 | 13:00 | pending | 0 | 0 | 0 | — | Cx is interested about ADU / tag as call back for there's no available specialist to transffer
2026-03-31 | 19:01 | Arlene | Ken Cash | (213) 447-4852 | 24001 Banning Blvd Carson 90745 |  | 2026-04-01 | 16:00 | pending | 0 | 0 | 0 | — | He is interested in SB 9, (2  houses subdivide into 20),he is available for an appointment between 4-5pm tomorrow - wants a call back from the consulatant before coming
2026-04-01 | 09:07 | China (Stephany) | ROCKY TAN | (626) 905-3084 | 2563 Leebe Ave, POMONA, CA 91768 |  | 2026-04-01 | 13:00 | ia | 15 | 5 | 0 | — | Transferring
2026-04-01 | 09:57 | Jennifer Alobin | Alexander Echeverry | (562) 250-6167 | 6611 11th Avenue, Los Angeles, CA 90043 (provided) | ADU | 2026-04-01 | 2 hrs | transfer | 0 | 0 | 0 | — | succesfully xfer
2026-04-01 | 10:00 | Sharon | Michael Garcia |  |  |  | 2026-04-01 |  | dnc | 0 | 0 | 0 | — | Manually added — confirmed in chat, no original template
2026-04-01 | 10:25 | Gerene | Sara Palazzola | (714) 623-4669 | 5624 Tower Rd Riverside CA 92506 |  | 2026-04-01 | 17:00 | transfer | 0 | 0 | 0 | — | Wants to be transferred now
2026-04-01 | 10:26 | Ruel | PEDRO GONZALEZ | (626) 230-8616 | *LEAD* |  | 2026-04-01 |  | ia | 15 | 5 | 0 | — |
2026-04-01 | 10:37 | Lily/Shery | SAMUEL CLARIDA | (562) 505-6342 | 1345 W CENTRAL AVE, BREA, CA 92821 |  | 2026-04-03 | 13:00 | confirmed | 0 | 0 | 0 | — |
2026-04-01 | 14:42 | Ruel | DEBORAH WEST | (626) 833-2634 | 200 CHINCHILLA ST, LA HABRA, CA 90631 |  | 2026-04-01 | 11:00 | dnc | 0 | 0 | 0 | — |
2026-04-01 | 14:47 | Rein | RAYMOND GARCIA | (562) 685-6373 | 2909 Yearling St, Lakewood, CA 90712 |  | 2026-04-03 | 8 9 am | pending | 0 | 0 | 0 | — | requesting for CB on friday interested  to talk to coordinator / _transferring_
2026-04-01 | 17:13 | Irene | Jeffrey Kang | (770) 377-1800 | ':5918 OCEAN TERRACE DR |  | 2026-04-03 | -2pm | pending | 0 | 0 | 0 | — | The customer is interested about ADU
2026-04-01 | 17:17 | Lily/Shery | ROBERT SHAW | (818) 640-1742 | 1745 THURBER PL, BURBANK, CA 91501 |  | 2026-04-03 | 13:00 | pending | 0 | 0 | 0 | — | he wanted to consult with the consultant , interested about ADU, advised to call him back by friday. cx agree
2026-04-01 | 18:02 | Richelle | SARAH LEE | (805) 499-4150 | 3812 San Nicolas Ct, Newbury Park, CA 91320 |  | 2026-04-03 | 14:00 | pending | 0 | 0 | 0 | — |
2026-04-03 | 09:31 | Jha/Allan | WILFREDO MARTINEZ | (323) 305-3709 | 604 W 43RD ST, LOS ANGELES, CA 90037 |  | 2026-04-03 | 14:00 | transfer | 0 | 0 | 0 | — |
2026-04-03 | 09:50 | Jha/Allan | SALLY CHOI | (213) 270-4787 | 15309 S WILTON PL, GARDENA, CA 90249 |  | 2026-04-03 | 13:00 | transfer | 0 | 0 | 0 | — |
2026-04-03 | 09:54 | China (Stephany) | IGNACIO LOPEZ | (562) 325-4588 | 4139 Maris Ave, PICO RIVERA, CA 90660 |  | 2026-04-06 |  | dnc | 0 | 0 | 0 | — |
2026-04-03 | 10:35 | Irene | Rudy LUEVANO | (626) 922-2943 | 216 S ARMEL AVE |  | 2026-04-03 | 10:00 | transfer | 0 | 0 | 0 | — | interested in adu
2026-04-03 | 11:04 | Jha/Allan | Paul Parilla | (909) 913-1277 | 6190 Morning  RANCHO CUCAMONGA, CA 91737 |  | 2026-04-03 | 15:00 | transfer | 0 | 0 | 0 | — |
2026-04-03 | 11:21 | China (Stephany) | alex ortiz | (626) 252-8361 | 11451 Elmcrest St, El Monte, CA 91732 |  | 2026-04-06 |  | transfer | 0 | 0 | 0 | — |
2026-04-03 | 14:12 | China (Stephany) | SHIRLEY BEE | (951) 924-0397 | 9109 Mines Ave, PICO RIVERA, CA 90660 |  | 2026-04-05 | 15:00 | pending | 0 | 0 | 0 | — | Transferring
2026-04-03 | 14:26 | Jennifer Alobin | Dennis Senyonjo | (818) 602-6123 | 25611 Palma Alta Dr, Valencia, CA 91354 | JADU | 2026-04-06 | 10:00 | pending | 0 | 0 | 0 | — | cx wants to know more about the program / cb
2026-04-03 | 14:45 | Jennifer Alobin | Irma Fernandez | (626) 808-6373 | 415 Redfield Ave Los angeles CA 90042 | ADU | 2026-04-06 | 14:00 | pending | 0 | 0 | 0 | — | she is the HO and interested in the program/cb
2026-04-03 | 14:46 | Arlene | ROMAN  JANIEC | (626) 523-0888 | 1154 N Glendora Ave  Glendora  CA 91741 |  | 2026-04-06 | 11:00 | pending | 0 | 0 | 0 | — | remodelling and rebuilding the house, agreed for a visit on Monday - he is available all day
2026-04-03 | 14:49 | Rein | DAVID/MARTHA OLIVAS | (915) 630-1672 | 22210 ROUNDUP DR, WALNUT, CA 91789 |  | 2026-04-06 | 10:00 | pending | 0 | 0 | 0 | — | asking for callback 1st before  10 am sunday both are homeowners / _transferring_
2026-04-03 | 15:38 | Richelle | paramjit hans | (209) 324-7727 | 6777 daryn dr w hill 91307 |  | 2026-04-06 | 09:30 | confirmed | 0 | 0 | 0 | — | callback on monday want to know more about the program
2026-04-03 | 15:42 | Jennifer Alobin | Elaine Paredes | (323) 788-0880 | 11832 Peak Rd CHATSWORTH CA 91311 | ADU | 2026-04-06 | 10:00 | confirmed | 0 | 0 | 0 | — | she is interested adding a unit advise to call her back on monday
2026-04-03 | 16:31 | Jennifer Alobin | Edith Lascola | (760) 902-1673 | 68081 Corta rd cathedral Ca 92234 | ADU | 2026-06-26 | 10:00 | pending | 0 | 0 | 0 | — | she is interested about the program and will be expecting my cb. / ‎[4/3/26, 4:45:57 PM] ~ China ✨: ‎GIF omitted
2026-04-03 | 16:56 | Richelle | UCHECHI NKWOCHA | (909) 569-9679 | 10396 SPADE DR, LOMA LINDA, CA 92354 |  | 2026-04-06 | 10:00 | pending | 0 | 0 | 0 | — | Want to know more about the program
2026-04-03 | 17:01 | Arlene | Shabnum Husain | (714) 206-8407 | 3825 Fremont Dr Corona CA  92881 |  | 2026-04-06 | 18:00 | confirmed | 0 | 0 | 0 | — | retired - agreed for a visit - she is very interested for rental income because she is already retired - home owner and decision maker
2026-04-03 | 17:06 | Jennifer Alobin | Dorothy Vinson | (909) 626-3763 | 1128 E La Verne Ave POMONA 91767 | ADU | 2026-04-06 | 2.30 - 3pm | confirmed | 0 | 0 | 0 | — | Interested to know more about the program / ‎[4/3/26, 5:07:08 PM] ~ Arlene Pernez: ‎GIF omitted
2026-04-03 | 17:12 | Irene | S ARKIS VARSBED | (818) 369-7043 | 2920  Hopeton Rd La Crescenta Ca |  | 2026-04-06 | 14:00 | pending | 0 | 0 | 0 | — | interested in adu  / ‎[4/3/26, 5:13:22 PM] ~ Arlene Pernez: ‎GIF omitted
2026-04-03 | 17:33 | China (Stephany) | MARIA DEL PILAR IRASTORZA | (323) 359-2191 | 6520 alamo avenue bell ca, CUDAHY, CA 90201 |  | 2026-04-06 |  | pending | 0 | 0 | 0 | — |
2026-04-03 | 17:46 | Rein | Angel / ROSA BUSTONS | (323) 357-2602 | 464 S WOODS AVE, LOS ANGELES, CA 90022 |  | 2026-04-13 | 10:00 | pending | 0 | 0 | 0 | — | planning to build two bedroom  home owner and decision maker / _transferring_
2026-04-03 | 17:53 | Lily/Shery | JENNIFER GARCIA | (714) 728-9420 | 421 N 12TH ST, MONTEBELLO, CA 90640 |  | 2026-04-06 | 13:00 | pending | 0 | 0 | 0 | — | Mr. Garcia requested a visit this coming Monday for assessment and is interested in ADU.
2026-04-06 | 09:10 | Arlene | Ventura  Madrigal | (562) 595-2349 | 34 Savona Walk LONG BEACH CA  90803 |  | 2026-04-06 | 13:00 | transfer | 0 | 0 | 0 | — | xferrring
2026-04-06 | 09:55 | Jhen | WILLIAM WEBB | (818) 383-1734 | 3090 TRIUNFO CANYON RD CA |  | 2026-04-06 | 13:00 | ia | 15 | 0 | 0 | — | xferrring
2026-04-06 | 10:00 | Arlene | Vickie Mendez |  |  |  | 2026-04-06 |  | dnc | 0 | 0 | 0 | — | Manually added — confirmed in chat, no original template
2026-04-06 | 10:00 | Dianne | David Zuniga |  |  |  | 2026-04-06 |  | confirmed | 0 | 0 | 0 | — | Manually added — confirmed in chat, no original template
2026-04-06 | 10:02 | Aubrey | Tommy | (818) 383-1734 | 90043 LA CARD CA |  | 2026-04-06 | 13:00 | transfer | 0 | 0 | 0 | — | xferrring
2026-04-06 | 10:02 | Jennifer Alobin | Sandra Argueta speak to husband | (213) 820-7795 | 1231 S Wilton Pl Los angeles CA 90019 | ADU | 2026-04-07 | 14:00 | dnc | 0 | 0 | 0 | — | speak to Mr. Argueta HO and deccision maker he is interested with adu
2026-04-06 | 10:05 | Aubrey | Tommy Morgan | (323) 296-4360 | 90043 LA CARD CA |  | 2026-04-06 | 12:00 | transfer | 0 | 0 | 0 | — | He is the HO and planning to add ADU the dialer name isher mothers name
2026-04-06 | 10:20 | Arlene | VICKIE  MENDEZ | (562) 201-7470 | 658 S ROWAN AVE LOS ANGELES |  | 2026-04-06 | 14:00 | transfer | 0 | 0 | 0 | — |
2026-04-06 | 10:33 | Jennifer Alobin | Jose Lopez | (818) 573-3659 | 9119 Wakefield Ave panorama 91402 | ADU | 2026-04-07 | 3.30pm | dnc | 0 | 0 | 0 | — | succesful xfer spoke to mrs.Lopez
2026-04-06 | 11:48 | Irene | MALAK KAMEL | (760) 508-7409 | 14605 GOLDEN TRL VICTORVILLE ca | ADU | 2026-04-07 | 3.o0pm | transfer | 0 | 0 | 0 | — | Interested in Adu
2026-04-06 | 12:05 | China (Stephany) | CARLOS GOMEZ | (323) 816-6504 | 4909 Templeton St, LOS ANGELES, CA 90032 |  | 2026-04-06 | 17:00 | transfer | 0 | 0 | 0 | — | Transferring
2026-04-06 | 12:17 | Irene | christopher Sandoval | (323) 793-5219 | 1345 west 36 play los angeles california pstcode 9007 | ADU | 2026-04-06 | 18:00 | transfer | 0 | 0 | 0 | — | Transferring
2026-04-06 | 12:18 | Jarelene | david zuniga | (909) 534-7431 | 26764 13TH ST | ADU | 2026-04-07 | 16:00 | transfer | 0 | 0 | 0 | — | Interested in Adu / transferring / ‎[4/6/26, 12:19:21 PM] ~ Arlene Pernez: ‎GIF omitted
2026-04-06 | 12:39 | Arlene | QUEEN STANCH | PROJECT: | 10928 S OSAGE AVE, INGLEWOOD, CA 90304 |  | 2026-04-06 | 3pm today | dnc | 0 | 0 | 0 | — |
2026-04-06 | 12:40 | Arlene | Queen Stanch | (310) 431-6476 | 10928 S Osage Ave, Inglewood, CA 90304 |  | 2026-04-06 | 15:00 | transfer | 0 | 0 | 0 | — |
2026-04-06 | 12:44 | Lily/Shery | GUADALUPE MARTINEZ | (323) 833-5438 | 241 E 60TH ST, LOS ANGELES, CA 90003 |  | 2026-04-06 | 16:00 | dnc | 0 | 0 | 0 | — | interested in ADU give a callback later with the consultant for further information about ADU.  / CX is not the home owner but he is the one living since the owner which is his brother is now living i
2026-04-06 | 12:55 | China (Stephany) | RICARDO ENRIQUEZ | (909) 210-0469 | 6655 OHARE CT, FONTANA, CA 92336 |  | 2026-04-06 | 17:00 | dnc | 0 | 0 | 0 | — | Transferring
2026-04-06 | 14:10 | Rein | FEDERICO HYAMS | (909) 322-4480 | 1267 GLENCLAIRE DR, Walnut, CA 91789 |  | 2026-04-07 | 10:00 | dnc | 0 | 0 | 0 | — | Transferring
2026-04-06 | 14:55 | Irene | Jason Prada | (909) 277-5294 | 25941 9TH STRET APARTMNT 20 sT.SAN BERNARDINO | ADU | 2026-04-06 | 18:00 | dnc | 0 | 0 | 0 | — | Transferring
2026-04-06 | 15:52 | China (Stephany) | JONES HARRISON | (323) 756-2567 | 2113 LOHENGRIN ST, LOS ANGELES, CA 90047 |  | 2026-04-06 | 17:00 | transfer | 0 | 0 | 0 | — | Transferring
2026-04-06 | 16:52 | Lily/Shery | jonah | Anonymous | 11170 Mountain View Ave, San Bernardino, CA 92354, |  | 2026-04-06 |  | transfer | 0 | 0 | 0 | — | Anonymous / _transferring_
2026-04-06 | 17:01 | Dianne | rimon carapet | (818) 956-7537 | 91205 glendale  ca |  | 2026-04-07 | 19:00 | pending | 0 | 0 | 0 | — | Mom is the HO, the son is the decision maker. She told that she will give my number to his son to call me back.
2026-04-07 | 09:25 | Jha/Allan | SERGIO GARCIA | (323) 677-8482 | 3209  W Washington, LOS ANGELES, CA 90019 |  | 2026-04-07 | 15:00 | dnc | 0 | 0 | 0 | — |
2026-04-07 | 09:33 | Jhen | SALVADOR GONZALEZ | PROJECT: ADU | 3926 SUMMIT DR CA 90602 |  | 2026-04-07 | 13:00 | dnc | 0 | 0 | 0 | — |
2026-04-07 | 09:33 | Jhen | Salvador Gonzalez | (213) 712-1897 | 3926 Summit Dr CA 90602 |  | 2026-04-07 | 13:00 | transfer | 0 | 0 | 0 | — |
2026-04-07 | 11:57 | Jhen | MARIA DUVAL | (323) 439-9286 | 1134 west 69 st los angeles ca 90044 |  | 2026-04-07 | 15:00 | dnc | 0 | 0 | 0 | — | Transferring
2026-04-07 | 12:15 | China (Stephany) | SEAN GOLLER | (201) 421-8395 | 4321 Kingswell Ave, LOS ANGELES, CA 90027 |  | 2026-04-07 | 15:00 | ia | 15 | 10 | 0 | — | Transferring
2026-04-07 | 12:36 | Irene | Tommy Blackwelder | PROJECT: adu | 5811 PINE CANYON DR BAKERSFIELD |  | 2026-04-07 | ongoing | dnc | 0 | 0 | 0 | — | interested in Adu / transferrinfg
2026-04-07 | 12:37 | Irene | Tommy Blackwelder | (661) 414-5021 | 5811 Pine Canyon Dr Bakersfield |  | 2026-04-07 | 15:00 | transfer | 0 | 0 | 0 | — | Customer is interested in ADU. / Transferring
2026-04-07 | 13:02 | Liz | DOUGLAS MOTLEY | (909) 338-3557 | PO BOX 6032 CRESTLINE CA 92325 |  | 2026-04-07 | 15:00 | dnc | 0 | 0 | 0 | — |
2026-04-07 | 14:38 | Dianne | BRIAN HALVERSON | (951) 361-2244 | 15724 LUCKY HORSE LANE PARKER CA |  | 2026-04-09 | 13:00 | transfer | 0 | 0 | 0 | — | INTERESTED IN ADU
2026-04-07 | 15:13 | Dianne | SANDRA FINLEY | (909) 242-2084 | 11996 WELLER PL MORENO VALLEY  CA |  | 2026-04-09 | 13:00 | transfer | 0 | 0 | 0 | — | INTERESTED IN ADU
2026-04-07 | 15:57 | Rhen | Felicia Toloza | (562) 743-6847 | 11537 Elvins St, Lakewood  CA, CA 90715 |  | 2026-04-09 | 11:00 | confirmed | 0 | 10 | 0 | — | interested in ADU
2026-04-07 | 16:02 | Rein | AGUSTIN TOLENTINO | (310) 878-7993 | 748 EAST 135 TH STREET, LOS ANGELES, CA 90059 |  | 2026-04-09 | REMARKS: | confirmed | 0 | 10 | 0 | — | 13430 south new Hampshire ave gardena california 90247 he wants to build ADU in this address / _transferring_  / ‎[4/7/26, 4:03:17 PM] ~ China ✨: ‎GIF omitted
2026-04-07 | 18:10 | Rhen | Eric Sanchez | (909) 331-1460 | 6617, Rancho Cucamonga  CA, 91739 |  | 2026-04-09 | 15:00 | pending | 0 | 0 | 0 | — | interested in ADU / CB for transfer on Thursday
2026-04-09 | 10:37 | Rein | VENKATESH NATARAJAN | (716) 491-7507 | 127 W Norgate St, Glendora, CA 91740 |  | 2026-04-09 | 14:00 | ia | 15 | 0 | 0 | — | Transferring
2026-04-09 | 10:39 | Gerene | NICHOLE SANCHEZ JESUS | (661) 675-7323 | 39533 171st St E, Palmdale, CA 93591 |  | 2026-04-09 | ANYTIME | ia | 15 | 0 | 0 | — | she is interested to have adu / speaks Spanish but she speaks English as well and understand / wants our speacialist to come over to ther house / help me to confirm address and name
2026-04-09 | 11:01 | Jennifer Alobin | John Min | (714) 369-0150 | 12610 Marywhite St.El Monte Ca 91732 | Adu | 2026-04-09 | 14:00 | ia | 15 | 0 | 0 | — | transferred
2026-04-09 | 11:01 | Arlene | MARCOS PEREZ | (323) 434-5730 | 11014 Coolhurst Dr Whittier   CA  90606 |  | 2026-04-09 | 14:00 | confirmed | 0 | 15 | 0 | — | xfring
2026-04-09 | 11:02 | Benica | MANUEL PINON | (626) 667-1567 | 17350 WEST TEMPLE SP 295, LA PUENTE, CA 91744 |  | 2026-04-09 | REMARKS: | dnc | 0 | 0 | 0 | — | Transferring
2026-04-09 | 11:40 | Arlene | Crispin Gonzalez | (310) 631-5908 | 3338 Alma Ave |  | 2026-04-09 | 15:00 | transfer | 0 | 0 | 0 | — | xfering / ‎[4/9/26, 11:41:23 AM] ~ Arlene Pernez: ‎image omitted
2026-04-09 | 12:53 | Irene | Gorge :VLAHAKIS | (661) 340-2335 | 1911 KENTUCKY ST BAKERSFIELD |  | 2026-04-09 | tom 1-6 | transfer | 0 | 0 | 0 | — | interested in garage adu / transfrring
2026-04-09 | 15:06 | Liz | TERRY GIMENEZ | (818) 424-2268 | 1220 HILLCREST AVE. PASADENA CALIFORNIA |  | 2026-04-09 | 16:35 | transfer | 0 | 0 | 0 | — | TRANSFERRING / ‎[4/9/26, 3:06:44 PM] ~ China ✨: ‎GIF omitted
2026-04-09 | 15:38 | Gerene | ANNETT  DEANFRASIO | (818) 709-2147 | 20159 LONDELIUS ST CANOGA PARK CA 91306 |  | 2026-04-10 | 16:00 | confirmed | 0 | 5 | 0 | — | interested of having ADU / explain to her those benifits that she could have adding ADU / aggreed to visit her house tom and help me to confirm her information / advise to call her back HO agreed
2026-04-09 | 16:35 | Liz | CALEB LOPEZ | (209) 262-0050 | 7305 Anne Cir, Winton, CA 95388 |  | 2026-04-10 | 17:00 | dnc | 0 | 0 | 0 | — | ‎[4/9/26, 4:36:01 PM] ~ China ✨: ‎sticker omitted
2026-04-09 | 17:05 | Irene | Jason  Grahan | (310) 629-9903 |  |  | 2026-04-10 | 14:00 | pending | 0 | 0 | 0 | — | interested in Adu
2026-04-09 | 17:28 | Jarelene | ashgy lujan | (562) 200-8937 | 10414 MAPLEDALE ST, BELLFLOWER, CA 90706 |  | 2026-04-10 | 09:00 | pending | 0 | 0 | 0 | — | cx interested in adu. and she wants an appointment if the client already knows more infos about the fundings and programs. / will cb tomorrow at 9am
2026-04-09 | 17:36 | Rhen | ANNETT DEANFRAS | (818) 709-2147 | 20159 LONDELIUS ST CANOGA PARK |  | 2026-04-10 | 14:00 | pending | 0 | 0 | 0 | — | interested in ADU / cb tomorrow for transfer
2026-04-09 | 17:39 | Rein | ROHELIO VILLANUEVA | (805) 876-6134 | 14445 Avenida Colonia, Moorpark, CA 93021 |  | 2026-04-10 | 11:00 | pending | 0 | 0 | 0 | — |
2026-04-09 | 18:00 | Liz | IVA CAHILL | (424) 558-8146 | 1004 SIERRA PLACE CA 90503 |  | 2026-04-10 | ANYTIME TOMORROW | pending | 0 | 0 | 0 | — | for callback tomorrow
2026-04-09 | 18:26 | Lily/Shery | trevis / carrie canto | (323) 377-0115 | 1643 W 60TH ST ,LOS ANGELES , CA |  | 2026-04-10 | 10:00 | pending | 0 | 0 | 0 | — | for callback tomorrow
2026-04-10 | 09:59 | Aiza | Donald Maesel | (909) 377-3912 | 254 N Laurel Ave, Upland, CA 91786 |  | 2026-04-10 | 15:00 | transfer | 0 | 0 | 0 | — | ADU / ‎[4/10/26, 10:04:20 AM] Derek: ‎image omitted
2026-04-10 | 10:00 | Aiza | Donald Maedel |  |  |  | 2026-04-10 |  | confirmed | 0 | 10 | 0 | — | Manually added — confirmed in chat, no original template
2026-04-10 | 10:00 | Rein | Raymond Garcia |  |  |  | 2026-04-10 |  | confirmed | 0 | 0 | 0 | — | Manually added — confirmed in chat, no original template
2026-04-10 | 10:11 | Jennifer Alobin | Harris Carmack | (323) 934-3384 | 5728 Brynhurst Ave Los Angeles Ca 90043 | ADU | 2026-04-10 | 15:00 | dnc | 0 | 0 | 0 | — | xferring
2026-04-10 | 10:35 | Lily/Shery | MARTHA OLMOS | (714) 642-8585 | 2429 FOLSOM ST, LOS ANGELES, CA 90033 |  | 2026-04-11 |  | pending | 0 | 0 | 0 | — | CX is in rush but interested in adu call back tommorow 1pm
2026-04-10 | 12:08 | Rhen | Zakir Khan | (626) 391-2500 | 6715 Mclennan Ave |  | 2026-04-10 | 17:00 | transfer | 0 | 0 | 0 | — | interested in ADU / transferring / ‎[4/10/26, 12:09:13 PM] ~ China ✨: ‎GIF omitted
2026-04-10 | 12:18 | Liz | EDGAR RUIZ-SALAZAR | (760) 596-8045 | 12477 FLAGSTONE CT CA 92392 |  | 2026-04-10 | 18:00 | dnc | 0 | 0 | 0 | — | Transferring
2026-04-10 | 12:31 | Gerene | JASON GRANT | (310) 629-9903 | 2800 Buckingham Rd, Los Angeles, CA 90016, |  | 2026-04-10 | ANYTIME TODAY | dnc | 0 | 0 | 0 | — | WANTS ME TO TRANSFFER THE CALL TO SPEACIALIST TO HAVE SOME INFO / INTERESTED TO HAVE ADU
2026-04-10 | 12:33 | Irene | BiNH NGUYEN | (714) 683-3867 | 1105  W PARK AVE ANAHEM CA |  | 2026-04-09 | 15:00 | dnc | 0 | 0 | 0 | — | THE Customer interested in garage  conversion
2026-04-10 | 12:43 | Rhen | Max Hampton | (805) 304-1333 | 309 Sinaloa Rd |  | 2026-04-10 | 14:00 | transfer | 0 | 0 | 0 | — | interested in ADU / transferring
2026-04-10 | 15:58 | Benica | SHERI DUNNER | (310) 404-6661 | 1489 BIENVENEDA AVE, PACIFIC PALISADES, CA 90272 |  | 2026-04-13 | 13:00 | pending | 0 | 0 | 0 | — |
2026-04-10 | 16:26 | Jennifer Alobin | Betty Crandall | (323) 867-5309 | 1100 wilcher blvd unit 1700 Los angeles Ca | ADU | 2026-04-13 | 19:00 | pending | 0 | 0 | 0 | — | She is the HO and decision maker / ‎[4/10/26, 4:27:50 PM] ~ China ✨: ‎sticker omitted
2026-04-10 | 16:57 | Jarelene | Linda Woodburn | (818) 414-6574 | 648 Cambridge Dr |  | 2026-04-12 | 13:00 | pending | 0 | 0 | 0 | — | cx interested in adu.
2026-04-10 | 17:02 | Aiza | VICTORIA MEZA | (562) 547-9353 | 11551 Maza St Norwalk, CA 90650 |  | 2026-04-12 | 10:00 | confirmed | 0 | 0 | 0 | — | Look for Victorina Meza (daughter) who speaks English and can assist with translation, as customer is Spanish-speaking
2026-04-10 | 17:28 | Benica | HECTOR ROBLES | (562) 335-0013 | 6828 BOER AVE, WHITTIER, CA 90606 |  | 2026-04-12 | 13:00 | pending | 0 | 0 | 0 | — | client is interested  in adu / he was asking about the cost but i told him that all information will be discuss by the licensed agent
2026-04-10 | 17:44 | Jennifer Alobin | Linda Walls | (310) 213-9311 | 13925 South Nestor Ave Compton Ca 90222 | JADU | 2026-04-12 | 15:00 | pending | 0 | 0 | 0 | — | she is the HO and decision maker
2026-04-10 | 18:02 | Irene | Orlando Sanders | (582) 716-8745 | 7308 louise Ave.Van Nuys CA,91406 |  | 2026-04-12 | 13:00 | dnc | 0 | 0 | 0 | — | THE Customer interested in garage  conversion
2026-04-13 | 09:12 | Jhen | Charles Lewis | (818) 599-0016 | 906 North Orchard Drive Burbank CA 91506 |  | 2026-04-13 | 10:00 | transfer | 0 | 0 | 0 | — |
2026-04-13 | 09:28 | Aiza | GERARDO GARCIA | (424) 703-1553 | 747 W 1ST ST, SAN PEDRO, CA 90731 |  | 2026-04-13 | 16:00 | transfer | 0 | 0 | 0 | — | Transferring
2026-04-13 | 10:47 | China (Stephany) | JOHN CHAVEZ GABRIELA CHAVEZ | (213) 500-0006 | 2330 Coral St., Los Angeles, CA 90031 |  | 2026-04-13 | 15:00 | ia | 15 | 0 | 0 | — | Transferring
2026-04-13 | 10:59 | Gerene | JAVIER CADENAS | (562) 668-2207 | 4057 Olive St, Bell Gardens, CA 90201 |  | 2026-04-13 | 17:00 | pending | 0 | 0 | 0 | — | CX INTERESTED IN ADU / WANTS TO BE TRANSFFERED / ‎[4/13/26, 11:00:09 AM] ~ China ✨: ‎GIF omitted / ‎[4/13/26, 11:06:31 AM] Derek: Javier Cadenas - call back tomorrow ‎image omitted
2026-04-13 | 11:56 | Jennifer Alobin | Benjamin Macalalad | (714) 337-5766 | 36648 dafodil ct lake elsinor ca 92532 | adu | 2026-04-13 | 16:00 | transfer | 0 | 0 | 0 | — |
2026-04-13 | 12:01 | Arlene | Victor Funez | (323) 360-6178 | 3917 S Budlong Ave #C LA CA 90037 |  | 2026-04-14 | 12:00 | confirmed | 0 | 0 | 0 | — | Transferring
2026-04-13 | 14:51 | China (Stephany) | JESUS CARREON | (626) 926-6682 | 741 N Astell Ave, WEST COVINA, CA 91790 |  | 2026-04-13 | REMARKS: | transfer | 0 | 0 | 0 | — | Customer needs to ask a few questions to confirm if ADU can be built on the property. / Transferring / 13709 Nelson Ave / La Puente, CA 91746
2026-04-13 | 15:23 | Jennifer Alobin | Myra Serrano | (626) 437-4023 | 281 N CRAIG AVE Pasadena ca 91107 | Garage conversion | 2026-04-14 | 16:00 | confirmed | 0 | 0 | 0 | — | shes interested in adu want to know more informatiion scheduled appt might change transferred
2026-04-13 | 15:29 | Ryan | Rozina Ahmad | (562) 991-3042 | 8547 Rives Ave DOWNEY, CA 90240 | ADU | 2026-04-14 | 9am PCT | dnc | 0 | 0 | 0 | — | Customer owns a house in Downey and is interested in generating rental income instead of selling. / Mentioned today is her birthday and she is originally from Pakistan. / Agreed to be transferred
2026-04-13 | 17:07 | Rhen | BETTY PIVOVAROFF | (661) 946-6562 | 1703 POLO CT, LANCASTER, CA 93535 |  | 2026-04-14 | 12:00 | pending | 0 | 0 | 0 | — | interested in ADU / CB tomorrow for transfer
2026-04-13 | 17:41 | Jennifer Alobin | Jose Avila | (818) 422-2301 | 7717 Cleon Ave Sun Valley Ca 91352 | Garage conversion | 2026-04-19 | 15:00 | pending | 0 | 0 | 0 | — | he is the decision maker want to know more information bout the program.availability is sunday / ‎[4/13/26, 5:42:57 PM] ~ China ✨: ‎sticker omitted
2026-04-14 | 11:39 | Rhen | Troy Gnerre | (562) 201-2191 | 15927 jalon rd. la mirada ca 90638 |  | 2026-04-14 | 15:00 | dnc | 0 | 0 | 0 | — | interested in adu  / TRansferring
2026-04-14 | 14:20 | Benica | MARSIRLENE CARPENTER | (760) 662-3376 | 18042 HINTON ST, HESPERIA, CA 92345 |  | 2026-04-14 | REMARKS: | dnc | 0 | 0 | 0 | — | Transferring
2026-04-14 | 15:42 | Arlene | ROBERT OZAETA | (909) 219-1667 | 2563 Whhispering Pines DR Running Sprinmgs CA 92382 |  | 2026-04-20 | 16:00 | dnc | 0 | 0 | 0 | — | xferring / ‎[4/20/26, 9:48:07 AM] ~ China ✨: ‎GIF omitted / ‎[4/20/26, 9:54:55 AM] Derek: ‎image omitted
2026-04-14 | 15:43 | Jarelene | Rick Ochoa | (951) 454-1939 | 317 S Joy StCorona, CA 92879, USA |  | 2026-04-15 | 18:00 | transfer | 0 | 0 | 0 | — | cx interested in adu. and she wants an appointment if the client already knows more infos about the fundings and programs. / transferring
2026-04-14 | 16:00 | Jhen | ROSA ALAMILLA | (909) 636-3736 | 13033 BASSWOOD AVE CHINO CA 91710 |  | 2026-04-14 | 18:00 | transfer | 0 | 0 | 0 | — | Transferring
2026-04-14 | 16:57 | Jennifer Alobin | Pejman Partiyeli | (310) 666-0712 | 2207 parnell ave Los Angeeles Ca 90064 | ADU | 2026-04-15 | 11:00 | confirmed | 0 | 0 | 0 | — | xferred
2026-04-14 | 17:24 | Rein | APOLONIO MARTINEZ | (323) 830-7699 | 526 W 88Th Pl, LOS ANGELES, CA 90044 |  | 2026-04-15 | 17:00 | pending | 0 | 0 | 0 | — | CB tom before 5 agreed to visit after work Joselyn is her daughter who speak english for him willing to visit the property and to know what's best adu program / _transferring_
2026-04-14 | 17:35 | Liz | Sabrina Feuttechine | (661) 916-4388 | 1704 SIERRA VIEW AVE Pennsylvania |  | 2026-04-15 | 19:00 | pending | 0 | 0 | 0 | — | TRANSFERRING
2026-04-14 | 18:17 | Kemberly | Hee Ja Lee | (714) 609-2472 | 1122 Glenhaven Ave Fullerton, CA 92835. |  | 2026-04-15 | 13:00 | pending | 0 | 0 | 0 | — | Client is interested to know more about the program / ‎[4/14/26, 6:28:16 PM] ~ Arlene Pernez: ‎GIF omitted
2026-04-15 | 09:19 | China (Stephany) | JOHN NAZARIAN | (310) 560-6053 | 2151 Ravensfield Ln, LOS ANGELES, CA 90077 |  | 2026-04-15 | 15:00 | transfer | 0 | 0 | 0 | — | John speaks French mostly. Mohammad can translate
2026-04-15 | 10:18 | Nikita | PAUL ALLEN | (562) 294-9594 | 10546 E Summer Breeze Dr, Moreno Valley, CA 92557 | ADU | 2026-04-24 | 11:00 | dnc | 0 | 0 | 0 | — | TRANSFERRING
2026-04-15 | 10:55 | Jennifer Alobin | Omobola Adeleke | (626) 639-9186 | 20 E Market St, Long Beach, CA 90805 | ADU | 2026-04-15 | 16:00 | pending | 0 | 0 | 0 | — | was not able to transfer shes with the patient now.  / ‎[4/15/26, 11:11:48 AM] Derek: Pejman Partiyeli - CONFIRMED!!! 💰💰💰 / cx called back the confirmer and set for the 17th!!! / @⁨~Jennifer Alobin⁩ G
2026-04-15 | 11:18 | Sharon | BERNARDO AGUINAR | (714) 357-3162 | 8592 Lullaby Ln, Stanton, CA 90680 |  | 2026-04-16 | 11:00 | transfer | 0 | 0 | 0 | — | lead is not yet sure if what time he will be available tomorrow. asked him that I scheduled him for a consultation  but will call him tomorrow first to confirm the exact time
2026-04-15 | 12:04 | Rein | CHRISTOS PABLICO | (310) 429-9548 | 5103 W 130TH ST, HAWTHORNE, CA 90250 |  | 2026-04-17 | after 2 pm | dnc | 0 | 0 | 0 | — | Requesting for CB on Friday since he is Off agreed for cb to know more about program
2026-04-15 | 12:45 | Jomar | Clifton Hughley | (562) 500-4420 | 4448 ELM AVE LONG BEACH CA 90807 |  | 2026-04-15 | 13:00 | transfer | 0 | 0 | 0 | — | Wants to know all the process. Already aware to connect with project coordinator. Owned single family home
2026-04-15 | 14:45 | Irene | Rosita Feliza Agcaoili | (626) 665-8175 | 3603 Meadowlark St El Monte CA 91732 |  | 2026-04-15 | 15:00 | transfer | 0 | 0 | 0 | — | Customer is interested in garage project. / Transferring
2026-04-15 | 15:06 | Rein | DORA PORTILLO | (323) 362-8293 | 1584 W 24 th St, Los Angeles, CA 90007 |  | 2026-04-15 | 16:30 | ia | 15 | 10 | 0 | — | need to know what program it is but thingking of a garrage convertion  or whatever adu program thats fits to her property.  / _transferring_
2026-04-15 | 15:48 | Jhen | luis guzman | (213) 369-4176 | PHONE NUMBER: 2133694176 | adu |  | 18:00 | dnc | 0 | 0 | 0 | — |
2026-04-15 | 16:33 | China (Stephany) | JUAN JIMENEZ | (323) 842-4548 | 1131 Brookdale Ave, LA HABRA, CA 90631 |  | 2026-04-15 | 18:00 | dnc | 0 | 0 | 0 | — | Transferring
2026-04-16 | 09:43 | Jarelene | RICHARD MOUSER | (626) 841-2281 | 181 E LOMA ALTA DR, ALTADENA, CA 91001 |  | 2026-04-16 | 13:00 | transfer | 0 | 0 | 0 | — | cx interested in adu. but wants to know first all the options and information about ADU. / XFEERRING / ‎[4/16/26, 9:44:18 AM] ~ China ✨: ‎sticker omitted
2026-04-16 | 09:48 | Benica | RAFAELA TREJO | (760) 235-5759 | 427 S LORENA ST, LOS ANGELES, CA 90063 |  | 2026-04-16 | 13:00 | dnc | 0 | 0 | 0 | — | Transferring
2026-04-16 | 10:20 | Benica | AMY GERTZ | (310) 497-6043 | 2520 DEVONSHIRE LN, ALTADENA, CA 91001 |  | 2026-04-16 | 13:00 | transfer | 0 | 0 | 0 | — | Transferring
2026-04-16 | 11:30 | Aiza | MOHAMED IBRAHIM | (626) 354-8385 | 1021 N Avenue 64, Los Angeles, CA 90042 |  | 2026-04-16 | 13:00 | transfer | 0 | 0 | 0 | — | Transferring
2026-04-16 | 11:34 | Benica | KENNETH DAY | (714) 206-1074 | 8971 BLACKHEATH CIR, WESTMINSTER, CA 92683 |  | 2026-04-16 | 14:00 | transfer | 0 | 0 | 0 | — | clients daugther is interested about ADU kristine  takamori, daughter / 714-425-9413 / _transferring_  / ‎[4/16/26, 11:35:13 AM] ~ Arlene Pernez: ‎GIF omitted / ‎[4/16/26, 11:35:20 AM] ~ China ✨: ‎GIF
2026-04-16 | 11:34 | Benica | Kristine Takamori | (714) 425-9413 | 8971 Blackheath Cir, Westminster, CA 92683 |  | 2026-04-16 | 14:00 | transfer | 0 | 0 | 0 | — | we spoke to her father Kenneth Day, who said she is interested in ADU.
2026-04-16 | 11:56 | China (Stephany) | LINDA ORTEGA | (310) 324-9750 | 16104 S Denker Ave, GARDENA, CA 90247 |  | 2026-04-16 | 16:00 | dnc | 0 | 0 | 0 | — | Transferring
2026-04-16 | 12:50 | China (Stephany) | YOAV SARRAF | (310) 749-9628 | 1253 Westholme Ave, LOS ANGELES, CA 90024 |  | 2026-04-16 | 17:00 | transfer | 0 | 0 | 0 | — | Transferring
2026-04-16 | 15:56 | Benica | RUSSELL JOHNSON | (818) 800-6773 | 15935 BERMUDA ST, GRANADA HILLS, CA 91344 |  | 2026-04-16 | 17:00 | dnc | 0 | 0 | 0 | — | Transferring
2026-04-16 | 16:02 | Lily/Shery | NATHANIEL PINTO | (362) 684-0439 | 216 W GLADSTONE ST, SAN DIMAS, CA 91773 |  | 2026-04-17 | 14:00 | transfer | 0 | 0 | 0 | — | cx is interested about ADU but busy right now, call-back tomorrow afternoon 2pm on his avail time.
2026-04-16 | 16:07 | Kemberly | EDUARDO ROJOS | (213) 842-6045 | 869 Avenue A, Redondo Beach, CA 90277 |  | 2026-04-16 | 18:00 | dnc | 0 | 0 | 0 | — | Transferring
2026-04-16 | 16:34 | Aiza | Mike Mitchell | (909) 738-0007 | 6715 DANA AVE MIRA LOMA ca 91752, MIRA LOMA, CA 91752 |  | 2026-04-18 | anytime after 2:00 pm | transfer | 0 | 0 | 0 | — | Transferring
2026-04-16 | 18:01 | Gerene | HAZEL BELL | (323) 734-1669 | 1333 W 37th St Los Angeles CA 90007 |  | 2026-04-17 | 14:00 | pending | 0 | 0 | 0 | — | wants to talk to his son first / but she is the home owner in a single family home / HO  hang up but tried to call her again to clarify the appointment and told her that i'll call her back tomorrow
2026-04-17 | 09:28 | Irene | Hhelga  Wagner | (310) 540-1595 | 21701  VICKY  AVENUE  TORRANCE 90503 |  | 2026-04-19 | 13:00 | transfer | 0 | 0 | 0 | — | Customer wants an inspection scheduled Sunday. / Transferring
2026-04-17 | 12:47 | Arlene | Arnetta  JOHNSON | (310) 756-9568 | 19437 Radlett AveCarson, CA 90746, USA |  | 2026-04-19 | 14:00 | transfer | 0 | 0 | 0 | — | her mother is the home owner and she is the decsion maker /  xferring
2026-04-17 | 13:51 | Arlene | Alfredo Gonzalez | (310) 720-5993 | 122 W Reeve St COMPTON CA 90220 |  | 2026-04-19 | 17:00 | transfer | 0 | 0 | 0 | — | xferring
2026-04-17 | 15:09 | Gerene | BRIAN HALVERSON | (951) 361-2244 | 15724 LUCKY HORSE LANE PARKER CA 98855 |  | 2026-04-19 | ANYTIME | pending | 0 | 0 | 0 | — | INTERESTED WITH ADU HIS THE HOME OWNER / AGREED FOR OUR LICENSED AGENTS TO VISIT ON SUNDAY / HO STILL ON THE LINE BUT HIS BUSY BUT ALRTEADY GOT THE INFO
2026-04-17 | 15:49 | Jhen | VICTOR LOZADA | (562) 305-7166 | 3595 SANTA FE AVE, LONG BEACH, CA 90810 |  | 2026-04-19 | 15:00 | pending | 0 | 0 | 0 | — | manufactured home / want to know more about ADU/ please call him 2hrs before the time of the appointment
2026-04-17 | 16:45 | Gerene | JERMAINE COOPER | (562) 313-0766 | 2502 DASHWOOD ST LAKEWOOD CA 90712 |  | 2026-04-19 | 17:00 | pending | 0 | 0 | 0 | — | HE IS THE SON OF THE HO AND HE IS INTERESTED OF ADU / HE WANT'S TO GET HIS DAD'S CONSENT FOR ADDING ADU ON THERE PROPERTY / HE AGREE THAT WE WILL CALL HIM BACK ON SUNDAY SO THAT HE'S DAD WILL BE THERE
2026-04-17 | 17:23 | Lily/Shery | WILFREDO DAGAN | (323) 717-0730 | 1436 W 37th St, Los Angeles, CA 90018 |  | 2026-04-11 | 14:00 | pending | 0 | 0 | 0 | — | CX IS CURRENTLY AT WORK , AVAILBALE TIME TO TALK SUNDAY 2Pm, wanted to know more about ADU.  / ‎[4/17/26, 5:23:42 PM] ~ China ✨: ‎GIF omitted
2026-04-17 | 17:39 | China (Stephany) | ENRIQUE ESPEJEL | (909) 786-9406 | 7791 Sheridan Way, FONTANA, CA 92336 |  | 2026-04-19 | 15:00 | pending | 0 | 0 | 0 | — |
2026-04-17 | 17:53 | Arlene | BARBARA WRIGHT | (323) 298-0838 | 5147 Village Grn LOS ANGELES |  | 2026-04-20 | 15:00 | dnc | 0 | 0 | 0 | — | homeowner and decison maker - available on monday -call back - confirmed appt
2026-04-17 | 18:32 | Gerene | JERALD CHAMALES | (310) 440-3407 | 359 N Bristol Ave Los Angeles CA 90049 |  | 2026-04-19 | 11:00 | pending | 0 | 0 | 0 | — | HE IS THE OWNER OF THE PROPERTY AGREED THAT OUR LICENSED AGENTS COULD GO TO VISIT HIM ON SUNDAY
2026-04-20 | 10:23 | Nikita | ROBIN WIELAND | (818) 648-5854 | 13407 Collins St, Van Nuys, CA 91401 |  | 2026-04-20 | 13:00 | dnc | 0 | 0 | 0 | — | Transferring
2026-04-20 | 11:18 | Rhen | ANGIE BASILA | (805) 499-6569 | 1644 GLIDER CT, NEWBURY PARK, CA 91320 |  | 2026-04-21 | 12:00 | dnc | 0 | 0 | 0 | — | wants to know about ADU / ‎[4/20/26, 11:20:12 AM] ~ China ✨: ‎GIF omitted
2026-04-20 | 11:33 | Arlene | Enrique Martinez | (909) 996-3369 | 17187 Pine Ave Fontana CA 92335 |  |  |  | transfer | 0 | 0 | 0 | — |
2026-04-20 | 12:15 | Arlene | ZAID  ABDULHAMEEN | (909) 567-4195 | 9154 Trey AveRiverside, CA 92503, USA |  | 2026-04-20 | 4 or 5 PM | transfer | 0 | 0 | 0 | — | xferring
2026-04-20 | 15:35 | Gerene | RODOLFO ALVARADO | (702) 351-3871 | 770 MELHAM AVE LA PUENTE CA 91744 |  | 2026-04-21 | 19:00 | transfer | 0 | 0 | 0 | — | WANTS TO TALK TO SPEACIALIST WANTS TO HAVE  / INFO ABOUT ADU
2026-04-20 | 16:48 | Arlene | LAURA ARMSTRONG | (323) 271-6302 | 231 E 102ND ST  LOS ANGELES CA  90003 |  | 2026-04-21 | 18:00 | transfer | 0 | 0 | 0 | — | xferring
2026-04-20 | 17:55 | China (Stephany) | ALEXANDER BERBER | (714) 791-9368 | 1521 E Fairhaven Ave, ORANGE, CA 92866 |  | 2026-04-21 | 15:00 | pending | 0 | 0 | 0 | — | Transferring
2026-04-21 | 10:32 | Gerene | RONDA BRUTON | (310) 953-8443 | 12411 S SAN PEDRO ST LOS ANGELES CA 90061 |  | 2026-04-21 | 17:30 | transfer | 0 | 0 | 0 | — | WANTS TO KNOW BETTER ABOUT ADU WANTS TO BE TRANSFFERED FOR MORE INFO
2026-04-21 | 11:54 | Ivy | ROBERT TEMPLETON | (310) 877-8700 | 3233 FEDERAL AVE 3233 FEDERAL AVE 90066 |  | 2026-04-22 | 15:00 | transfer | 0 | 0 | 0 | — | THE CX DONT'T HAVE AN IDEA ABOUT ADU BUT WANTED TO HAVE IT IN THE FUTUREA
2026-04-21 | 16:34 | Ryan | DOUGLAS MCKINLEY | (562) 394-6118 | 4514 Hazelbrook Ave, Long Beach CA,  90808 |  | 2026-04-21 | 17:00 | transfer | 0 | 0 | 0 | — | Transferring
2026-04-21 | 16:48 | Rhen | Tracy Kwok/ XUE GUO | (626) 235-7206 | 2407 Kelburn Ave |  | 2026-04-21 | 19:00 | transfer | 0 | 0 | 0 | — | interested in ADU / ‎[4/21/26, 4:48:46 PM] Derek: Douglas McKinley - not interested, needs someone young at the appt. legally ‎image omitted / ‎[4/21/26, 4:49:59 PM] ~ China ✨: ‎GIF omitted
2026-04-21 | 17:01 | Arlene | DAO NGUYEN | (714) 683-3867 | 1769 WESTP AVE, ANAHEIM, CA 92804 |  | 2026-04-21 | 19:00 | pending | 0 | 0 | 0 | — | single family home - 2 bedroom 1bath /    / _ Cx wanted to be visit with 1 of our licensed agents today
2026-04-22 | 09:19 | Aiza | VINCENTE MEDINA | (626) 632-0076 | 14443 7TH ST, WHITTIER, CA 90602 |  | 2026-04-22 | 17:00 | transfer | 0 | 0 | 0 | — | Transferring
2026-04-22 | 09:47 | Aiza | ABDUL AHMADI | (714) 783-6671 | 2107 CAROL DR, FULLERTON, CA 92833 |  | 2026-04-22 | after 5:00 pm | ia | 15 | 15 | 0 | — | garage conversion / _transferring_ / ‎[4/22/26, 9:48:21 AM] ~ China ✨: ‎GIF omitted
2026-04-22 | 10:58 | Jennifer Alobin | RENAY Sehgal | (909) 319-6163 | 5646 W PHILLIPS BLVD  ONTARIO CA  91762 | Additional Backyard unit | 2026-04-27 | 11:00 | transfer | 0 | 0 | 0 | — |
2026-04-22 | 11:00 | Irene | Natasha  Myers | (714) 624-8135 | 5741 CITRUS RANCH CIR YORBA LINDA CA 92887 |  | 2026-04-23 | 17:00 | transfer | 0 | 0 | 0 | — |
2026-04-22 | 11:18 | Irene | Jaime Rosales | (626) 200-8798 | 3283 DEL VINA ST PASADENA CA,91107 |  | 2026-04-23 | 16:00 | transfer | 0 | 0 | 0 | — | Interested to talk to the expert but right now he has a work
2026-04-22 | 15:28 | Rein | Sam / STACY LUMBREZER | (203) 721-1538 | 2523 7TH AVE, LOS ANGELES, CA 90018 |  | 2026-04-23 | 11:00 | transfer | 0 | 0 | 0 | — | waiting for visit last week but no one coming / _transferring_ / ‎[4/22/26, 3:29:19 PM] ~ China ✨: ‎GIF omitted
2026-04-22 | 16:53 | China (Stephany) | JOEL STEINGOLD | (310) 424-8342 | 7040 2Nd Ave, LOS ANGELES, CA 90043 |  | 2026-04-23 | 19:00 | confirmed | 0 | 20 | 0 | — | Transferring
2026-04-23 | 09:23 | Rein | NADER TASHAKOR | (818) 216-8833 | 7530 SAUSALITO AVE, WEST HILLS, CA 91307 |  | 2026-04-23 | 14:00 | ia | 15 | 15 | 0 | — | asking if after a year is there any interest on payment / _transferring_  / ‎[4/23/26, 9:24:51 AM] ~ China ✨: ‎sticker omitted
2026-04-23 | 09:26 | Irene | PHICHAN YAUNGSRI | (714) 478-5172 | 12581 VISTA PANORAMA SANTA ANA CA 92705 |  | 2023-04-23 | -1-2PM | transfer | 0 | 0 | 0 | — | INTERESTED IN ADU / TRANSFERRING / ‎[4/23/26, 9:26:31 AM] ~ Arlene Pernez: ‎GIF omitted
2026-04-23 | 10:14 | Mac | erica luna |  | 12514 magnolia ave |  |  | REMARKS: WANTED TO SPEAK WITH THE CLOSER ANGEL TOOK OVER | dnc | 0 | 0 | 0 | — | WANTED TO SPEAK WITH THE CLOSER ANGEL TOOK OVER
2026-04-23 | 10:14 | Mac | Erica Luna | (909) 967-5219 | 12514 Magnolia Ave, San Bernardino, CA 92407 |  | 2026-04-23 | REMARKS: | transfer | 0 | 0 | 0 | — | Customer is the decision-maker. / Requested to speak with a closer
2026-04-23 | 11:00 | Jhen | AHMED SABER | (573) 647-1471 | 36 TAVELLA PL, FOOTHILL RANCH, CA 92610 |  | 2026-04-23 | 18:30 | dnc | 0 | 0 | 0 | — | tomorrow / 6:30pm/ ADU/ / _transferring_ / ‎[4/23/26, 11:02:03 AM] ~ Arlene Pernez: lol ‎GIF omitted
2026-04-23 | 11:29 | Jennifer Alobin | Pedro Ochoa | (714) 526-3646 | 316 N RANCHITO ST ANAHEIM CA 92801 | ADU | 2026-04-24 | 17:00 | confirmed | 0 | 15 | 0 | — | Transferring — accepted by Angel
2026-04-23 | 11:39 | Jennifer Alobin | Pacita Weil | (323) 493-8377 | 13115 KESWICK ST NORTH HOLLYWOOD CA | Adu | 2026-04-26 | 11 Am | pending | 0 | 0 | 0 | — | Customer wants more details about the ADU program and pricing. / Requested a callback on Friday for transfer/confirmation, but we couldn't reach her today. / Said also to contact via text or voicemail
2026-04-23 | 16:36 | Rein | TONY DIAS | (909) 910-8547 | 6119 walnut ave chino ca 91710 |  | 2026-04-23 | 19:00 | confirmed | 0 | 15 | 0 | — | Transferring
2026-04-23 | 16:44 | Lily/Shery | JOSIE WALSH | (248) 910-1717 | 6717 CHIMINEAS AVE, RESEDA, CA 91335 |  | 2026-04-23 |  | transfer | 0 | 0 | 0 | — | cx is interested for adu. / _transferring_ / ‎[4/23/26, 4:45:19 PM] ~ China ✨: ‎GIF omitted
2026-04-23 | 17:34 | Jennifer Alobin | Lilya MERDZHIMEKIAN | (818) 422-6008 | 7950 MAMMOTH AVE PANORAMA CITY CA 91402 | ADU | 2026-04-26 | 15:00 | pending | 0 | 0 | 0 | — |
2026-04-23 | 17:47 | Jennifer Alobin | Arne Bass | (909) 541-8646 | 1318 BALLERINA PL Pomonaa Ca 91768 | Additional unit | 2026-04-28 | 13:30 | pending | 0 | 0 | 0 | — | will call him monday afternn to xfer tuesday is his OFF / ‎[4/23/26, 5:49:11 PM] ~ China ✨: ‎GIF omitted
2026-04-24 | 10:33 | Rein | Mamata KHANDAI | (949) 609-9635 | 20 SAN ANGELO, FOOTHILL RANCH, CA 92610 |  | 2026-04-24 | 13:00 | ia | 15 | 5 | 0 | — | asking for estimate wants to know more about adu. want a seperate unit outside the house. / _transferring_ / ‎[4/24/26, 10:34:10 AM] ~ China ✨: ‎GIF omitted / ‎[4/24/26, 10:34:57 AM] Derek: ‎GIF omitt
2026-04-24 | 11:37 | Rhen | ISAAC MEDINA | (626) 277-9003 | 1922 FLORADALE AVE, SOUTH EL MONTE, CA 91733 |  | 2026-04-24 | 13:00 | transfer | 0 | 0 | 0 | — | interested in ADU / transferring / ‎[4/24/26, 11:37:32 AM] ~ China ✨: ‎GIF omitted
2026-04-24 | 12:28 | Jennifer Alobin | MARIO Marin | (714) 785-3637 | 1406 S FLOWER ST SANTA ANA  CA 92707 | ADU | 2026-04-26 | 13:00 | transfer | 0 | 0 | 0 | — | He is not available to xfer his at work now he is available on sunday / ‎[4/24/26, 12:29:12 PM] ~ China ✨: ‎GIF omitted / ‎[4/24/26, 12:30:28 PM] Derek: ‎GIF omitted
2026-04-24 | 12:47 | Lily/Shery | EUNHEE KWON | (253) 582-3094 | 2025 PRAY ST, FULLERTON, CA 92833 |  | 2026-04-24 | 15:00 | transfer | 0 | 0 | 0 | — | cx is interested for adu. / _transferring_
2026-04-24 | 12:51 | Rein | JOSE MEZA | (805) 796-1173 | 434 DOROTHY AVE, MOORPARK, CA 93021 |  | 2026-04-26 | after 1 pm | confirmed | 0 | 15 | 0 | — | wants a room addition / _transferring_ / ‎[4/24/26, 12:51:47 PM] ~ China ✨: ‎GIF omitted / ‎[4/24/26, 12:54:02 PM] Derek: Eunhee Kwon - out of town CB another time ‎image omitted
2026-04-24 | 13:19 | Arlene | PAUL YUNG | (310) 383-5406 | 3661 McLaughlin Ave, Los Angeles, CA 90066 |  | 2026-04-26 | 13:00 | dnc | 0 | 0 | 0 | — | Transferring
2026-04-24 | 16:02 | Gerene | CARLOS MENDOZA | (805) 248-2332 | 2723 TOLSTOY PL OXNARD CA 93033 |  | 2026-04-26 | 19:00 | pending | 0 | 0 | 0 | — | HO IS IN A GATED COMMUNITY HE AGREE THAT OUR LICENSED AGENTS CAN COME OVER TO HIS HOUSE ON SUNDAY 7 PM / HO IS BUSY HE'S AT WORK
2026-04-27 | 14:39 | Emil | Judy Goodman | PROJECT: ADU | 161 BREEZEWOOD ST CORONA CA 92879 |  | 2026-04-27 | 15:00 | transfer | 0 | 0 | 0 | — | Customer is the decision-maker
2026-04-27 | 17:07 | Jennifer Alobin | Joel Huerta | (310) 339-3498 | 531 SHIELDS DR SAN PEDRO CA  90731 | Garage Convertion | 2026-04-29 | 11:00 | dnc | 0 | 0 | 0 | — | cb @ 9am to xfer / ‎[4/27/26, 5:09:14 PM] ~ China ✨: ‎GIF omitted
2026-04-27 | 17:10 | Keith | JOSE SANCHEZ | (562) 458-7762 | 1551 MIKINDA AVE, LA HABRA, CA 90631 | N/A | 2026-04-28 | 11:00 | pending | 0 | 0 | 0 | — | cb @ 11am to discuss the ADU  / ‎[4/27/26, 5:11:46 PM] ~ China ✨: ‎GIF omitted
2026-04-27 | 17:56 | Keith | MARTIN JIMENEZ | (323) 489-9551 | 315 W 121ST ST, LOS ANGELES, CA 90061 | N/A | 2026-04-28 | 11:00 | pending | 0 | 0 | 0 | — | cb @ 11am to discuss the ADU / ‎[4/27/26, 5:58:20 PM] ~ China ✨: ‎GIF omitted
2026-04-27 | 17:59 | Jarelene | TYRES WALLACE | (909) 550-9501 | 11461 OLD SPRING RD, FONTANA, CA 92337 |  | 2026-04-28 | 13:00 | dnc | 0 | 0 | 0 | — | cb at 10am to transfer
2026-04-28 | 09:37 | Arlene | JAIME CAMARENA | (805) 901-1882 | 3148 S J St, Oxnard, CA 93033 |  | 2026-04-29 | 15:00 | confirmed | 0 | 5 | 0 | — | Transferring
2026-04-28 | 10:16 | Ivy | PIRAYEH SOHRABPOUR | (310) 254-5524 | 17707 MARTHA ST 91316 |  | 2026-04-30 | 11:00 | confirmed | 0 | 5 | 0 | — | want to have an ADU, want to know more about the cost  / trasferring / ‎[4/28/26, 10:17:11 AM] ~ China ✨: ‎GIF omitted
2026-04-28 | 10:40 | Ivy | CLIFFORD BIGLER | (661) 803-1203 | 28305 SIMSALIDO AVE 91350 |  | 2026-06-16 | 11:00 | transfer | 0 | 0 | 0 | — | NOT SURE TO ADDRESS SINCE HE'S MIAMI, YOUR INTERESTED OF HAVING AN ADU  / TRANSFERRING
2026-04-28 | 11:03 | Jarelene | DAVID STUARD | (310) 801-5096 | 5244 W 140TH ST, HAWTHORNE, CA 90250 |  | 2026-04-28 | 13:00 | transfer | 0 | 0 | 0 | — | Homeowner and decision-maker
2026-04-28 | 11:29 | Emil | Sean Weber / 3109903160 |  | 27441 RAINDANCE PL SANTA CLARITA CA 91350 |  | 2026-04-28 | 14:00 | confirmed | 0 | 5 | 0 | — |
2026-04-28 | 11:29 | Emil | Sean Weber | (310) 990-3160 | 27441 Raindance Pl, Santa Clarita, CA 91350 |  | 2026-04-28 | 14:00 | transfer | 0 | 0 | 0 | — | Customer is the decision-maker
2026-04-28 | 11:37 | Jarelene | shawn bahr | (949) 690-4898 | 2329 ocean ave , la californa 90291 |  | 2026-04-28 | 13:00 | ia | 15 | 5 | 0 | — | Homeowner and decision-maker
2026-04-28 | 11:42 | Arlene | Richard  Buck | (951) 805-8813 | 26760 Bia bueltas CA |  | 2026-04-28 | 17:00 | transfer | 0 | 0 | 0 | — | xferring / ‎[4/28/26, 11:42:54 AM] ~ China ✨: ‎GIF omitted
2026-04-28 | 11:51 | Rein | SCOTT EISNER | (818) 398-0630 | 18706 HILLSBORO RD, PORTER RANCH, CA 91326 |  | 2026-04-28 | 15:00 | transfer | 0 | 0 | 0 | — | wants to confirm about HOA / _transferring_ / ‎[4/28/26, 11:53:11 AM] ~ China ✨: ‎GIF omitted
2026-04-28 | 14:44 | Arlene | BRANDEN RAMOS | (661) 917-8862 | 44501 ENCANTO WAY, LANCASTER, CA 93536 |  | 2026-04-29 | 18:00 | transfer | 0 | 0 | 0 | — | gecondar units / _transferring_
2026-04-28 | 15:38 | Mac | RICHARD BUCK | (951) 805-8813 | 26760 VIA BUELTAS, TEMECULA, CA 92879 |  | 2026-04-28 |  | dnc | 0 | 0 | 0 | — | 26760 Via Vueltas / Temecula, CA 92590 / _transferring_
2026-04-28 | 15:45 | Marites | Roger Madugong | (626) 484-8816 | 12853 Ross Ave, Chino Hills, CA 91710 |  | 2026-04-28 | 17:00 | transfer | 0 | 0 | 0 | — |
2026-04-28 | 15:58 | Mac | DAMON GARR | (310) 722-8520 | 4212 W 61St St, LOS ANGELES, CA 90043 |  | 2026-05-05 | 15:00 | transfer | 0 | 0 | 0 | — | GARAGE DETACH / _transferring_ / ‎[4/28/26, 3:59:29 PM] ~ China ✨: ‎GIF omitted
2026-04-28 | 16:36 | Arlene | COREY PATE | (305) 407-0678 | 317 S BEACHWOOD DR, BURBANK, CA 91506 |  | 2026-04-30 | 15:00 | confirmed | 0 | 5 | 0 | — | garage conversion / _transferring_ / ‎[4/28/26, 4:37:35 PM] ~ China ✨: ‎GIF omitted
2026-04-28 | 17:14 | Irene | JUAN VARGAS | (323) 767-7816 | 11009 HOWARD ST WHITTIER CA 9060 |  | 2026-04-29 | -5pm | pending | 0 | 0 | 0 | — | INTRESTED IN GARAGE CONVERSION / ‎[4/28/26, 5:15:04 PM] Derek: ‎GIF omitted
2026-04-28 | 17:31 | Irene | Jose ramirez | (909) 371-7106 | 1047 SMOKETREE DR CORONA CA  92882 |  | 2026-04-29 | -1pm | pending | 0 | 0 | 0 | — | INTRESTED IN GARAGE CONVERSION  / ‎[4/28/26, 5:32:11 PM] ~ Arlene Pernez: ‎GIF omitted
2026-04-28 | 17:37 | China (Stephany) | Edward J Sylvester | (805) 801-1178 | 1245 Hillcrest Dr |  | 2026-04-29 | 11:00 | pending | 0 | 0 | 0 | — | —
2026-04-28 | 17:49 | Rhen | SAID SAADATI | (805) 477-8104 | 9166 SANTA MARGARITA RD, VENTURA, CA 93004 |  | 2026-04-29 | 14:00 | pending | 0 | 0 | 0 | — | interested and wants to know more about ADU / cb tom. for transfer / ‎[4/28/26, 5:50:04 PM] ~ China ✨: ‎GIF omitted
2026-04-29 | 10:03 | Mac | ARTHUR PARRIS | (562) 822-8051 | 1541 ELEANOR ST, LONG BEACH, CA 90805 |  | 2026-04-30 | 10:00 | confirmed | 0 | 5 | 0 | — | DETACH / _transferring_ / ‎[4/29/26, 10:03:40 AM] ~ China ✨: ‎GIF omitted / ‎[4/29/26, 10:03:46 AM] Derek: ‎GIF omitted
2026-04-29 | 11:28 | Monica | PIRAYEH SOHRABPOUR | (310) 254-5524 | 17707 MARTHA ST, ENCINO, CA 91316 |  | 2026-05-07 | 11:00 | transfer | 0 | 0 | 0 | — | User wants to reschedule the assessment / _transferring_
2026-04-29 | 15:27 | Rhen | VICTOR DIAZ | (951) 415-5868 | 2168 POWERS ST, POMONA, CA 91766 |  | 2026-04-29 | 19:00 | transfer | 0 | 0 | 0 | — | interested and wants to know more about ADU speak slowly / transferring / ‎[4/29/26, 3:27:48 PM] ~ China ✨: ‎GIF omitted
2026-04-29 | 17:05 | Jennifer Alobin | DEEPAK RAJAGOPAL | (310) 948-7171 | 1960 WINDING LN S PASADENA Ca  91030 |  | 2026-05-04 | 11:00 | pending | 0 | 0 | 0 | — | req to call him back on friday to xfer / ‎[4/29/26, 5:06:29 PM] ~ China ✨: ‎GIF omitted
2026-04-29 | 17:35 | China (Stephany) | NORAYR KESHISHYAN | (714) 701-9191 | 2417 E GLENOAKS BLVD, GLENDALE, CA 91206 |  | 2026-04-29 |  | pending | 0 | 0 | 0 | — |
2026-04-29 | 18:18 | Mac | GABRIEL GARCIA | (951) 533-1031 | 4422 ELIZABETH ST, CUDAHY, CA 90201 |  | 2026-04-30 | 18:00 | pending | 0 | 0 | 0 | — |
2026-04-30 | 10:00 | Aiza | Alejandro M |  |  |  | 2026-04-30 |  | ia | 15 | 10 | 0 | — | Manually added — confirmed in chat, no original template
2026-04-30 | 10:33 | Irene | Susan Turner | (951) 741-5338 | 2956 Stallion Way, Ontario, CA 91761 |  | 2026-04-30 | 14:00 | transfer | 0 | 0 | 0 | — | Transferring
2026-04-30 | 12:10 | Aiza | ALEJANDO M | (323) 448-5053 | 656 S IDIANA St, Los Angeles, CA 90023 |  | 2026-04-30 | 18:00 | transfer | 0 | 0 | 0 | — | Transferring
2026-04-30 | 12:13 | Arlene | BENJAMIN MACALALAD | (714) 337-5766 | 124 WEST ZANE STREET, LONG BEACH, CA 90805 |  | 2026-04-30 | 14:00 | dnc | 0 | 0 | 0 | — | 36648 dafodell ct lake elsinor ca 92532- this is his property - he wants small kitchen and bathroom installed / _transferring_ / ‎[4/30/26, 12:13:23 PM] Derek: ‎GIF omitted
2026-04-30 | 12:31 | Mac | HILDA MAGALLANDS | (909) 917-9953 | 10980 White Oak Ln, FONTANA, CA 92337 |  | 2026-04-30 | REMARKS: | transfer | 0 | 0 | 0 | — | want to know prices first before appt / _transferring_ / ‎[4/30/26, 12:32:37 PM] ~ China ✨: ‎GIF omitted
2026-04-30 | 12:42 | Ivy | CHAYA KAVKA | (347) 342-2153 | 119 S ORANGE DR  90036 |  | 2026-04-30 | 15:00 | dnc | 0 | 0 | 0 | — | iNTERESTED ON adu  / TRANSFERRING
2026-04-30 | 14:58 | Rein | LEONEL ARDON | (323) 271-6364 | 7853 Melva St, DOWNEY, CA 90242 |  | 2026-05-05 |  | transfer | 0 | 0 | 0 | — | He wants a visit by next week tue. will call him back again
2026-04-30 | 15:53 | Jarelene | RUCHI NARKAR | (929) 386-7213 | 1822 VERDE VISTA DR, MONTEREY PARK, CA 91754 |  | 2026-05-01 | 11:00 | transfer | 0 | 0 | 0 | — | cx is interested in adu, she says she already talked to other company. cx is asking for the name of our company. / i just told her that it will be provided by the program coordinator. take this free a
2026-04-30 | 16:21 | China (Stephany) | Marley Breaux | (909) 380-2108 | 10425 EL RANCHO DR, WHITTIER, CA 90606 |  | 2026-04-30 | 19:00 | dnc | 0 | 0 | 0 | — | Transferring
2026-04-30 | 17:19 | Rhen | EULALIO MACIAS | (310) 491-4690 | 10025 BURIN AVE, INGLEWOOD, CA 90304 |  | 2026-04-30 | 11:00 | pending | 0 | 0 | 0 | — | wants to know more about   ADU / cb tomorrow for transfer
2026-04-30 | 17:24 | Irene | THOMAS ANNARELLA | (714) 319-7879 | 7 SEBASTIAN, IRVINE, CA 92602 |  | 2026-05-01 | 16:00 | pending | 0 | 0 | 0 | — | wants to know more about   ADU / cb tomorrow for transfer  / ‎[4/30/26, 5:25:05 PM] ~ Arlene Pernez: ‎GIF omitted / ‎[4/30/26, 5:25:54 PM] ~ Ayz Tugaon: ‎GIF omitted / ‎[4/30/26, 5:27:35 PM] ~ China ✨
2026-05-01 | 10:25 | Nikita | MARAL BILEMJIAN | (818) 207-7771 | 722 East Orange Grove Avenue unit home townhouse, Burbank, CA 91501 |  | 2026-05-01 | 15:00 | transfer | 0 | 0 | 0 | — | (INBOUND)MAX ORTEGA APART GARAGE DOWN TOWNHOUSE.    SHE WANTED AN ADU FOR HER 3PM-4PM / _transferring_ / ‎[5/1/26, 10:25:59 AM] ~ China ✨: ‎GIF omitted
2026-05-01 | 10:29 | Ivy | TONY QUACH | (626) 802-8312 | 1228 S 3RD AVE 91006 |  | 2026-05-01 | 5 MINS FROM NOW 11AM | dnc | 0 | 0 | 0 | — | INTERESTED ADU  / TRANSFERRING
2026-05-01 | 10:50 | China (Stephany) | REBECCA NUNEZ SANTILLAN | (626) 257-4932 | 4037 Vineland Ave, Baldwin Park, CA 91706 |  | 2026-05-01 | 15:00 | dnc | 0 | 0 | 0 | — | Transferring
2026-05-01 | 12:34 | Arlene | ARUN PARIKH | (714) 991-4891 | 2749 N Surrey St, Orange, CA 92867 |  | 2026-05-03 | 14:00 | dnc | 0 | 0 | 0 | — | 7116 Larino ST Aneheim 92801 - add addtional room and patio he also wants it on the 2749 N Surrey - additiona bathroom and room- extra room on top of the backside for 2nd flooor / _transferring_
2026-05-01 | 16:32 | Mac | ARUNRAJ RAMALINGAM | (626) 636-1723 | 6141 Ivar Ave, TEMPLE CITY, CA 91780 |  | 2026-05-03 | 11:00 | confirmed | 0 | 5 | 5 | China (Stephany) | detach / _transferring_  / ‎[5/1/26, 4:35:38 PM] ~ China ✨: ‎GIF omitted / ‎[5/1/26, 4:36:25 PM] ~ Mac Chillain: ‎GIF omitted
2026-05-04 | 09:05 | China (Stephany) | REGINALD TAN | (661) 547-4466 | 25661 MAGNOLIA LN, STEVENSON RANCH, CA 91381 |  | 2026-05-04 | 15:00 | confirmed | 0 | 5 | 0 | — | cost // adu in back yard / _transferring_
2026-05-04 | 09:15 | Mac | FARIBORZ ROSTAMIAN | (916) 221-1920 | 13342 DIAMOND HEAD DR, TUSTIN, CA 92780 |  | 2026-05-04 | 19:00 | ia | 15 | 5 | 5 | China (Stephany) | Transferring
2026-05-04 | 09:42 | Mac | THANIA ROSSMAN | (562) 533-8102 | 1214 W 130th St, COMPTON, CA 90222 |  | 2026-05-04 | 18:00 | ia | 25 | 5 | 5 | China (Stephany) | Transferring
2026-05-04 | 11:03 | Arlene | ALFREDO SANTOS | (626) 372-5468 | 7233 Jamieson Ave, Reseda, CA 91335 |  | 2026-05-05 | 12:00 | transfer | 0 | 0 | 0 | — | interested in backyard cottages -spoke with ERin  and Brian Knor the home owner and decison maker - / _transferring_ / ‎[5/4/26, 11:04:54 AM] ~ Ivy Cuizon: ‎GIF omitted
2026-05-04 | 11:21 | Nikita | HANNAH RAZZOUQ | (714) 204-1961 | 523 N COLGATE ST, ANAHEIM, CA 92801 |  | 2026-05-04 | 18:00 | ia | 15 | 0 | 0 | — | callback on monday she wont be available today and tomorrow / she wanted adu near her balcony / _transferring_ / ‎[5/4/26, 11:22:00 AM] ~ China ✨: ‎GIF omitted
2026-05-04 | 11:49 | Mac | STEVE SCHMISSRAUTER | (818) 671-3958 | 20849 Exhibit Place, Woodland Hills, CA 91367 |  | 2026-05-04 | 15:00 | ia | 35 | 0 | 5 | China (Stephany) | Transferring
2026-05-04 | 12:12 | Arlene | POV SENG | (562) 928-2191 | 7938 Farm St, Downey, CA 90241 |  | 2026-05-04 | 15:00 | ia | 15 | 5 | 0 | — | garage conversion / _transferring_ / ‎[5/4/26, 12:13:13 PM] ~ China ✨: ‎GIF omitted / ‎[5/4/26, 12:13:37 PM] ~ Mac Chillain: ‎GIF omitted
2026-05-04 | 12:46 | China (Stephany) | GEORGE PICHARDO | (657) 358-9702 | 717 Grovemont St, SANTA ANA, CA 92706 |  | 2026-05-04 | 16:00 | transfer | 0 | 0 | 0 | — | Transferring
2026-05-04 | 14:14 | Rhen | JACOB JOSEPH | (626) 394-9533 | 1103 W WHITTLERS LN, ONTARIO, CA 91762 |  | 2026-05-04 | 17:00 | dnc | 0 | 0 | 0 | — | interested and wants to know more about ADU / transferring
2026-05-04 | 15:02 | Irene | Shaira Gomez | (310) 697-6124 | ›528 Paseo De La Playa, Redondo Beach, CA 90277 |  | 2026-05-05 | 13:00 | transfer | 0 | 0 | 0 | — | Interested in garage conversion. Transferring.
2026-05-05 | 09:14 | Rhen | Russell Szynokowski | (760) 792-4747 | 46750 riverside rd newberry spring ca 92365 |  | 2026-05-05 | 15:30 | dnc | 0 | 0 | 0 | — | interested and wants to know more about ADU / transferring / ‎[5/5/26, 9:15:03 AM] ~ China ✨: ‎GIF omitted
2026-05-05 | 09:30 | Rein | Mr. VERONICA GARCIA | (909) 380-2108 | 10425 EL RANCHO DR WHITTIER CA 90606, WHITTIER, CA 90606 |  | 2026-05-05 | 15:00 | dnc | 0 | 0 | 0 | — | Transferring
2026-05-05 | 09:54 | Mac | ALEJANDRA VACA | (805) 603-9588 | 6427 VASSAR CIR, MOORPARK, CA 93021 |  | 2026-05-05 | 03:00 | ia | 15 | 5 | 5 | China (Stephany) | Transferring
2026-05-05 | 11:03 | Aiza | FLORIDALMA TOVAR | (323) 819-9466 | 208 W 80Th St, LOS ANGELES, CA 90003 |  | 2026-05-06 | after 4:00 PM | transfer | 0 | 0 | 0 | — | interested in garage / _transferring_
2026-05-05 | 11:42 | Mac | ALFRED TURMAN | (661) 803-7583 | 15514 MEGAN DR, CANYON COUNTRY, CA 91387 |  | 2026-05-05 | 18:00 | dnc | 0 | 0 | 0 | — | Transferring
2026-05-05 | 11:54 | China (Stephany) | ben | (626) 822-7220 | 2209 BALWIN AVE, ARCADIA, CA 91007 |  | 2026-05-05 | 15:00 | transfer | 0 | 0 | 0 | — | Transferring
2026-05-05 | 12:36 | Jennifer Alobin | Parul Desai | (909) 248-0161 | 16081 Rincon Meadows Ave Chino CA 91708 |  | 2026-05-05 | 15:00 | dnc | 0 | 0 | 0 | — | Transferring
2026-05-05 | 12:49 | Rhen | WILLIAM MIRAHEM | (818) 586-0663 | 22524 PARAGUAY DR, SANTA CLARITA, CA 91350 |  | 2026-05-05 | 15:00 | transfer | 0 | 0 | 0 | — | interested in ADU
2026-05-05 | 17:14 | Rhen | ROBERT KENNETH DEMONTE | (805) 529-1304 | 3860 HUNTERS GROVE CT, MOORPARK, CA 93021 |  | 2026-05-06 | 14:00 | pending | 0 | 0 | 0 | — | interested in ADU / cb for transfer tomorrow / ‎[5/5/26, 5:15:24 PM] ~ China ✨: ‎sticker omitted
2026-05-05 | 17:18 | Rein | ROBERTO TELLEZ | (661) 268-9299 | 37050 95th St E, Littlerock, CA 93543 |  | 2026-05-06 | 14:00 | pending | 0 | 0 | 0 | — | seperate unit but dont want anything on back / _transferring_ / ‎[5/5/26, 5:19:20 PM] ~ China ✨: ‎GIF omitted
2026-05-05 | 17:55 | Mac | BIZEN YOHANNES | (323) 224-3991 | 1434 Montecito Dr, Los Angeles, CA 90031 |  | 2026-05-06 | 17:00 | pending | 0 | 0 | 0 | — |
2026-05-06 | 10:13 | Aiza | NANCY TUCKER | (661) 264-4610 | 16255 STAGECOACH AVE, PALMDALE, CA 93591 |  | 2026-05-08 | 11:00 | transfer | 0 | 0 | 0 | — | Transferring
2026-05-06 | 10:20 | Arlene | PETER ALBRECHT | (714) 432-8750 | 2339 Notre Dame Rd, Costa Mesa, CA 92626 |  | 2026-05-06 | 15:00 | ia | 15 | 5 | 0 | — | Garage convesion / _transferring_
2026-05-06 | 12:41 | Ivy | JOSE CRUZ | (661) 433-2462 | 37902 San Carlos Way, Palmdale, CA 93550 |  | 2026-05-06 | 18:30 | transfer | 0 | 0 | 0 | — | Interested in ADU / _transferring_ / ‎[5/6/26, 12:42:24 PM] ~ China ✨: ‎sticker omitted
2026-05-06 | 14:50 | Gerene | BUDD (nickname) | (714) 719-0202 | 961 Union Ave Costa Mesa CA 92627 |  | 2026-05-06 | afternoon | transfer | 0 | 0 | 0 | — | interested about adding ADU / wants to have  info told him to call him back tomorrow to transfer to speacialist / tried to get exact name but he wants to be answered first by our speacialist
2026-05-06 | 15:51 | Arlene | TRINA/ANTHONY ARREDONDO | (626) 598-2462 | 422 S Alta Vista Ave, Monrovia, CA 91016 |  | 2026-05-07 | 11:00 | dnc | 0 | 0 | 0 | — | Garage Conversion / _transferring_ / ‎[5/6/26, 3:52:33 PM] ~ China ✨: ‎GIF omitted
2026-05-06 | 17:00 | Rein | DEBORAH CHILDRESS | (562) 818-2026 | 8702 MEADOW RD, DOWNEY, CA 90242 |  | 2026-05-06 |  | pending | 0 | 0 | 0 | — |
2026-05-06 | 17:32 | Arlene | SANDRA CALDERON | (562) 417-1962 | 3576 Marshall St, Riverside, CA 92504 |  | 2026-05-07 | 18:00 | pending | 0 | 0 | 0 | — | wants to know more about it - the interest - the cost
2026-05-07 | 10:01 | Rhen | Moses Mendoza | (661) 733-5449 | 2734 Fairfield Ave Palmdale, CA 93550 |  | 2026-05-22 | HOME OWNER: Yes | pending | 0 | 0 | 0 | — | cx really interested and wants to know more about ADU but can't do an appointment today he thought it's just a call appointment since he's on a vacation.  Cb when he got home.
2026-05-07 | 11:13 | Rein | MARIA PEREZ | (323) 440-5414 | 6412 crescent st. los angeles california 90042 |  | 2026-05-08 | 15:00 | transfer | 0 | 0 | 0 | — | willing to the the garrage conversion and have question / _transferring_  / ‎[5/7/26, 11:14:47 AM] ~ China ✨: ‎GIF omitted
2026-05-07 | 12:49 | Aiza | MATTHEW PASTER | (323) 810-0314 | 3948 S Norton Ave, Los Angeles, CA 90008 |  | 2026-05-11 | After 11:00 | confirmed | 0 | 0 | 0 | — | garage conversion / _transferring_
2026-05-07 | 13:03 | Aiza | FEROZE THALIFFDEEN | (714) 371-6926 | 12971 Brittany Woods Dr, Santa Ana, CA 92705 |  | 2026-05-08 | after 6:00 | confirmed | 0 | 15 | 0 | — | Transferring
2026-05-07 | 14:33 | Ivy | TRACY REYES | (323) 898-4293 | 3633 MARMION WAY, LOS ANGELES, CA 90065 |  | 2026-05-07 | 18:00 | transfer | 0 | 0 | 0 | — | Transferring
2026-05-07 | 15:25 | Emil | Jack Garcia | (909) 380-2108 | 10425 El Rancho Dr, Whittier, CA 90606 |  | 2026-05-07 | 19:00 | transfer | 0 | 0 | 0 | — | —
2026-05-07 | 15:25 | Rein | ADA GOMEZ | (213) 296-8952 | 142 S NORMANDIE AVE LOS ANGELES, LOS ANGELES, CA 90004 |  | 2026-05-08 | 18:00 | transfer | 0 | 0 | 0 | — | Transferring
2026-05-07 | 15:34 | China (Stephany) | ERIC GONZALEZ | (909) 440-0223 | 1372 N Isadora Way, ONTARIO, CA 91764 |  | 2026-05-07 |  | transfer | 0 | 0 | 0 | — |
2026-05-07 | 16:48 | Irene | Augie  Martinez | (805) 276-5419 | 280 S Brent St. Ventura  CA  93003 |  |  |  | transfer | 0 | 0 | 0 | — | Interested for the  quatation
2026-05-07 | 17:18 | Rein | EILEEN/ MR JONES-DEVIN | (310) 906-8016 | 1434 east 122nd st. los agenles CA 90059 |  | 2026-05-10 | 11:00 | pending | 0 | 0 | 0 | — |
2026-05-07 | 18:29 | China (Stephany) | DAVID LUNA// ERIC | (661) 944-7796 | 13375 BERG ST, SYLMAR, CA 91342 |  | 2026-05-08 |  | pending | 0 | 0 | 0 | — |
2026-05-07 | 18:52 | Gerene | GEORGE MALKI | (562) 378-7909 | W 14th St LA, CA USA |  | 2026-05-08 | ANYTIME | pending | 0 | 0 | 0 | — | proactively say yes that he's interested with ADU and confirm he's last name and address and agreed that we can go to his property tom / cx hang up but calling him back
2026-05-08 | 10:56 | Rein | ADA PORTILLO | (323) 972-9590 | 4210 E San Luis St, COMPTON, CA 90221 |  | 2026-05-10 | 17:00 | confirmed | 0 | 0 | 0 | — | can understand english but if there's avail spanish assesor much better. his son is with her who can speak and understand english. / _transferring_
2026-05-08 | 11:29 | Mac | ALBERT REED | (301) 535-2654 | 11217 COMPTON AVE, LOS ANGELES, CA 90059 |  | 2026-05-10 | 10:00 | dnc | 0 | 0 | 0 | — | Transferring
2026-05-08 | 11:29 | Rein | ZUBAIR RAO | (310) 986-0824 | 30042 Avenida Esplendida, Rancho Palos Verdes, CA 90275 |  | 2026-05-10 | 11:00 | confirmed | 0 | 0 | 0 | — | Transferring
2026-05-08 | 13:02 | Mac | DAVID SHEFFIELD | (661) 285-8090 | 5836 Paddington Dr, Palmdale, CA 93552 |  | 2026-05-10 | REMARKS: | transfer | 0 | 0 | 0 | — | Customer wants to hear what we can offer before agreeing to a schedule. Transferring.  / ‎[5/8/26, 1:13:24 PM] ~ Alex Work Phone: Let's focus on building pipeline for Sun & Mon 🤩 ‎GIF omitted
2026-05-08 | 15:54 | China (Stephany) | patra  baxster | (310) 995-2416 | 14866 Daphne Ave |  | 2026-05-10 | 11:00 | pending | 0 | 0 | 0 | — | —
2026-05-08 | 17:08 | Arlene | ELIAS BARRON | (626) 825-8945 | 18438 E Fondale St, Azusa, CA 91702 |  | 2026-05-10 | 15:00 | pending | 0 | 0 | 0 | — | wants to know more about it -  the details , rebates and how it works
2026-05-11 | 09:49 | Jennifer Alobin | MR. LOTFIPOUR | (714) 376-7912 | 11925 Lambert orange CA. |  | 2026-05-11 | 13:00 | ia | 15 | 0 | 0 | — | —
2026-05-11 | 10:04 | China (Stephany) | Devinn Mcdaniel | (323) 295-9772 | 3709 Degnan Blvd, Los Angeles, CA 90018 |  | 2026-05-11 | 15:00 | dnc | 0 | 0 | 0 | — | Transferring
2026-05-11 | 10:05 | Nikita | DAVID BANG | (818) 912-7555 | 23414 Via Farallon, Valencia, CA 91355 |  | 2026-05-13 | 15:00 | confirmed | 0 | 0 | 0 | — | _transferring_
2026-05-11 | 10:07 | Rein | VICENTE GONZALEZ | (714) 875-6949 | 624 S Illinois St, ANAHEIM, CA 92805 |  | 2026-05-13 |  | pending | 0 | 0 | 0 | — | out of state need to talk to her wife asking for CB wednesday / CB ON WEDNESDAY / ‎[5/11/26, 10:07:48 AM] ~ China ✨: ‎GIF omitted / ‎[5/11/26, 10:09:49 AM] Derek: ‎image omitted
2026-05-11 | 10:13 | Jarelene | Dolores L Gonzalez | (818) 422-1086 | 10056 Bartee Ave, Pacoima, CA 91331 |  |  | REMARKS : not feeling well due to cough and colds, asking for a cb on wed or Friday. | pending | 0 | 0 | 0 | — | not feeling well due to cough and colds, asking for a cb on wed or Friday. / TAGGED AS CALLBACK.
2026-05-11 | 10:22 | Arlene | RAHEEM HASAN | (213) 447-1848 | 4420 DON FELIPE DR, LOS ANGELES, CA 90008 |  | 2026-05-11 | 17:00 | transfer | 0 | 0 | 0 | — | wants to hear more about ADU / _transferring_
2026-05-11 | 10:52 | China (Stephany) | James,Linda | (818) 908-8365 | 14225 Tiara St, VAN NUYS, CA 91401 |  | 2026-05-11 | 15:00 | transfer | 0 | 0 | 0 | — | _transferring_
2026-05-11 | 10:53 | Gerene | DAVID ARIAS | (562) 298-3146 | 14024 DITTMAR DR WHITTIER  CA 90605 |  | 2026-05-12 | ANYTIME | transfer | 0 | 0 | 0 | — | calling him back it seems cx had interest with ADU but needs to have information about it try to call him tomorrow for clarification / he help me confirm address and his name / call him back tomorrow
2026-05-11 | 14:13 | China (Stephany) | JAMES SELTZER | (310) 863-4401 | 1233 E 142Nd St, COMPTON, CA 90222 |  | 2026-05-11 | 18:00 | ia | 15 | 0 | 0 | — | Didn't transfer since it's lunch. Expecting a call from confirmation
2026-05-11 | 14:48 | Jarelene | ADDRESS: 25388 IDEAL AVE, LANCASTER, CA 93536 | (714) 317-4832 | 25388 IDEAL AVE, LANCASTER, CA 93536 |  | 2026-05-11 | 17:00 | transfer | 0 | 0 | 0 | — | is there any chance we can transfer thise the cx dont want to confirm his name, but based in in the dialer its ERIK BERG. / he said thats not his name abd dont want to say his name but wants to be tra
2026-05-11 | 15:05 | Arlene | JUDAH RAMIREZ | (310) 220-9943 | 435 W 9Th St, UPLAND, CA 91786 |  | 2026-05-11 | 18:00 | transfer | 0 | 0 | 0 | — | Transferring
2026-05-11 | 16:01 | Rein | EDGARDO SANCHEZ | (323) 216-1279 | 8718 Andes St, SAN GABRIEL, CA 91776 |  | 2026-05-18 |  | transfer | 0 | 0 | 0 | — |
2026-05-11 | 17:46 | Mac | CHELLE WELSH | (323) 466-7759 | 3121 Ledgewood Dr, Los Angeles, CA 90068 |  | 2026-05-11 | 10:00 | pending | 0 | 0 | 0 | — |
2026-05-11 | 18:00 | Arlene | YONGXING WU | (213) 330-5648 | 232 S Orange Blossom Ave, LA PUENTE, CA 91746 |  | 2026-05-12 | 15:00 | ia | 15 | 5 | 0 | — | wants to know how much is the amount that he needs for ADU - requesting for a Chinese property manager - he is using a  translator - / ‎[5/11/26, 6:12:04 PM] ~ China ✨: ‎GIF omitted
2026-05-12 | 10:34 | Arlene | LLOYD NORDLING | (424) 350-7422 | 2221 BELMONT LN REDONDO BEACH ca 90278, REDONDO BEACH, CA 90277 |  | 2026-05-13 | 18:30 | confirmed | 0 | 5 | 0 | — | Transferring
2026-05-12 | 10:56 | Gerene | GERARD FIGUEROA | (661) 433-1083 | 9558 LEONA AVE PALMDALE CA 93551 |  | 2026-05-12 | 19:00 | transfer | 0 | 0 | 0 | — | cx interested to have ADU but he wants to know how much will gonna cost him / agree that someone will visit him to check property but can transfer now 'cause he has important meeting
2026-05-12 | 11:28 | Mac | JAVIER MENDEZ | (323) 338-2516 | 134 E 53RD ST, LOS ANGELES, CA 90011 |  | 2026-05-12 | 19:00 | dnc | 0 | 0 | 0 | — | Transferring
2026-05-12 | 11:28 | Nikita | VICTOR GARCIA | (909) 380-2108 | 10425 EL RANCHO DR WHITTIER CA 90606, WHITTIER, CA 90606 |  | 2026-05-12 | 16:00 | dnc | 0 | 0 | 0 | — | today at 4pm HES INTERESTED ADU/ / _transferring_ / ‎[5/12/26, 11:29:14 AM] ~ China ✨: ‎GIF omitted
2026-05-12 | 13:20 | Mac | CARLOS GUTIERREZ | (323) 360-5139 | 2815 Elm St, Los Angeles, CA 90065 |  | 2026-05-12 | 17:00 | transfer | 0 | 0 | 0 | — | Expecting a call from confirmers.
2026-05-12 | 15:22 | Rein | PHIL GOFF | (213) 703-7758 | 1808 E 123Rd St, LOS ANGELES, CA 90059 |  |  |  | pending | 0 | 0 | 0 | — | Son is a co owner need to talk to his son asking for CB tom.need to know when son is avail / FOR CALLBACK
2026-05-12 | 15:31 | Jennifer Alobin | Jose Chavez | (714) 501-2288 | 14331 SOLEIL DR CORONA CA 92880 |  | 2026-05-13 | 16:00 | ia | 15 | 5 | 0 | — | Transferred.
2026-05-12 | 15:54 | Arlene | APOLONIO MARTINEZ | (323) 915-7559 | 526 W 88Th Pl, LOS ANGELES, CA 90044 |  | 2026-05-13 | 15:00 | ia | 15 | 10 | 0 | — | requesting for spanish consultant tom  / _transferring_
2026-05-12 | 16:42 | Rein | ERIKA MONCIVAIS DELGADO | (310) 422-5187 | 19502 Scobey Ave, CARSON, CA 90746 |  | 2026-05-18 | 19:00 | pending | 0 | 0 | 0 | — | she is also the owner but need to talk to his husband who make the descision requesting for cb / FOR CALLBACK
2026-05-12 | 17:24 | China (Stephany) | MARTIN PAZ | (626) 388-8709 | 15809 San Jose Ave, La Puente, CA 91744 |  | 2026-05-13 | 11:00 | pending | 0 | 0 | 0 | — | Back yard / Transferring
2026-05-13 | 09:17 | Mac | MOHAMMAD HARANDI | (310) 619-4455 | 3619 Sara Dr, Torrance, CA 90503 |  | 2026-05-13 | 10:00 | transfer | 0 | 0 | 0 | — | Transferring
2026-05-13 | 09:20 | Aiza | JUAN RUAN | (562) 833-3316 | 153 E Norton St, Long Beach, CA 90805 |  | 2026-05-14 | 11:00 | dnc | 0 | 0 | 0 | — | Transferring
2026-05-13 | 10:25 | Arlene | Robert  TORRES | (760) 861-9260 | 13435 Gunderson Ave, DOWNEY, CA 90242 |  | 2026-05-13 | 15:00 | transfer | 0 | 0 | 0 | — | wants a storage unit  in the backyardspoke with Robert / _transferring
2026-05-13 | 11:03 | Mac | TEYANNA WILLIAMS | (213) 500-4780 | 1707 W 39th Pl, LOS ANGELES, CA 90062 |  | 2026-05-14 | 12:00 | ia | 15 | 10 | 0 | — |
2026-05-13 | 11:05 | Aiza | MAXINE WILLIAMS | (424) 221-3812 | 1210 N PEARL AVE, COMPTON, CA 90221 |  | 2026-05-13 | 14:00 | ia | 15 | 10 | 0 | — | detached ADU / _transferring_ / ‎[5/13/26, 11:06:08 AM] ~ China ✨: ‎GIF omitted / ‎[5/13/26, 11:06:24 AM] ~ Arlene Pernez: ‎GIF omitted
2026-05-13 | 11:25 | Rein | PHIL YI | (213) 700-7445 | 16366 Santa Bianca Dr, HACIENDA HEIGHTS, CA 91745 |  | 2026-05-13 | 14:00 | ia | 15 | 10 | 0 | — |
2026-05-13 | 12:15 | Gerene | VICTOR GARCIA | (909) 380-2108 | 10425 EL RANCHO DR WHITTIER CA 90606, WHITTIER, CA 90606 |  | 2026-05-13 | 19:00 | transfer | 0 | 0 | 0 | — | INTERESTED ADU / _transferring_  / ‎[5/13/26, 12:16:32 PM] ~ China ✨: ‎GIF omitted
2026-05-13 | 12:24 | Jhen | TROY/JULIE WALLACE | (714) 812-8502 | 319 JACARANDA PL, FULLERTON, CA 92832 |  | 2026-05-13 | 18:00 | ia | 15 | 10 | 0 | — | cb after an hour / _transferring_ / ‎[5/13/26, 12:25:15 PM] ~ China ✨: ‎GIF omitted
2026-05-13 | 15:56 | Ivy | ANDREW RAGLAND | (909) 510-0745 | 14976 EDGEWOOD DR, EASTVALE, CA 92880 |  | 2026-05-14 | 13:00 | dnc | 0 | 0 | 0 | — |
2026-05-13 | 16:03 | Gerene | KUMAR SIVASANKARA | (909) 248-8989 | 7861 GARDEN PARK ST, CHINO, CA 91708 |  | 2026-05-14 | 23:00 | transfer | 0 | 0 | 0 | — |
2026-05-13 | 16:41 | Aiza | JAMES HEADLEY | (714) 321-3667 | 6702 Trask Ave, WESTMINSTER, CA 92683 |  | 2026-05-14 | 17:00 | transfer | 0 | 0 | 0 | — | garage conversion
2026-05-13 | 19:22 | Gerene | JIM NASER / MYLINE | (661) 360-7347 | 26945 Cuatro Milpas St Valencia CA 91354 |  | 2026-05-14 | 09:00 | pending | 0 | 0 | 0 | — | i didn't speak to the exact HO but he will be interested about this because the house is like a health care facility calling him back tomorrow to set appt and give some information how ADU could reall
2026-05-14 | 10:41 | Rein | ROBERT POWERS | (714) 631-5138 | 8100 Slauson Ave, MONTEBELLO, CA 90640 |  | 2026-05-14 | 13:00 | transfer | 0 | 0 | 0 | — |
2026-05-14 | 11:33 | Arlene | JOHNLINDA ROSS | (818) 621-5210 | 5720 Rista Dr, AGOURA HILLS, CA 91301 |  | 2026-05-14 | 17:00 | dnc | 0 | 0 | 0 | — | more space - extra room  gaming - / _transferring_
2026-05-14 | 11:46 | Gerene | BRIAN WEAR | (818) 653-9382 | 7325 HILLROSE ST, TUJUNGA, CA 91042 |  | 2026-05-15 | 16:00 | dnc | 0 | 0 | 0 | — |
2026-05-14 | 12:38 | Arlene | REGULO TOLENTINO | (714) 308-6006 | 10321 Par Ln, GARDEN GROVE, CA 92840 |  | 2026-05-14 | 17:00 | transfer | 0 | 0 | 0 | — | ADU Consultaion - / _transferring_
2026-05-14 | 12:51 | Jhen | MUTASHA WARREN | (661) 480-3861 | 3341 W AVENUE J4, LANCASTER, CA 93536 |  | 2026-05-14 | 17:00 | transfer | 0 | 0 | 0 | — |
2026-05-14 | 13:02 | Aiza | LUIS VARGAS husband / Maria Gomez - wife | (213) 268-5052 | 4551 Parton Ct, Lancaster, CA 93536 |  | 2026-05-17 | 13:00 | transfer | 0 | 0 | 0 | — | garage conversion / _transferring_
2026-05-14 | 14:35 | Mac | FLOR SPRADLIN | (661) 485-9776 | 45302 DATE AVE, LANCASTER, CA 93534 |  | 2026-05-15 | 10:00 | transfer | 0 | 0 | 0 | — |
2026-05-14 | 14:56 | Jennifer Alobin | Ladonna Moore | (310) 493-8528 | 10791 capistrano ave lenwood Ca 90262 |  | 2026-05-18 | 11:00 | pending | 0 | 0 | 0 | — | want to know more information and options cb on monday to be transferred.
2026-05-14 | 15:19 | Gerene | ROBERT FITZGERALD | (805) 297-4364 | 28830 STARTREE LN SANTA CLARITA CA 91390 |  | 2026-05-15 | 18:30 | dnc | 0 | 0 | 0 | — | INTERESTED OF ADU
2026-05-14 | 17:25 | Arlene | MAYRA ESCOBAR | (323) 663-9814 | 407 N Normandie Ave, LOS ANGELES, CA 90004 |  | 2026-05-15 | 17:00 | pending | 0 | 0 | 0 | — | wants additional room- 2nd floor / - she wants an appt early in the morning because she will be bust after 9 but sched it after her work instead
2026-05-14 | 17:38 | Nikita | CARLOS GARCIA | (925) 352-1503 | 42349 61ST ST W, LANCASTER, CA 93536 |  | 2026-05-17 |  | pending | 0 | 0 | 0 | — |
`;

  const leads = [];
  let seq = 0;
  LEADS_RAW.trim().split("\n").forEach(line => {
    const parts = line.split("|").map(s => s.trim());
    if (parts.length < 14) return;
    const [date, time, agentName, customer, phone, address, project, apptDate, apptTime, status, , spiff, tlBonus, tlRecipient, remarks] = parts;
    const agent = nameToAgent[resolveName(agentName)];
    if (!agent) {
      console.warn("Unknown agent in seed:", agentName);
      return;
    }
    const tlRec = (tlRecipient && tlRecipient !== "—") ? nameToAgent[resolveName(tlRecipient)] : null;
    const noteBits = [];
    if (project) noteBits.push(project);
    if (address) noteBits.push(address);
    if (remarks) noteBits.push(remarks);
    leads.push({
      id: uid(),
      campaign_id: campaign.id,
      agent_id: agent.id,
      seq: seq++,
      date,
      time,
      customer_name: customer || "",
      phone: phone || "",
      status,
      client_commission: 0,
      spiff: Number(spiff) || 0,
      tl_bonus: Number(tlBonus) || 0,
      tl_recipient_id: tlRec ? tlRec.id : null,
      appointment_date: apptDate || null,
      appointment_time: apptTime || null,
      notes: noteBits.join(" · "),
    });
  });

  {
    const iaByAgentDate = new Map();
    leads.forEach(l => {
      if (l.status === "ia") {
        const k = l.agent_id + "|" + l.date;
        if (!iaByAgentDate.has(k)) iaByAgentDate.set(k, []);
        iaByAgentDate.get(k).push(l);
      }
    });
    iaByAgentDate.forEach(arr => {
      arr.sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0));
      arr.forEach((l, idx) => {
        if (idx === 0)      l.client_commission = campaign.rate_ia;
        else if (idx === 1) l.client_commission = Math.max(0, campaign.ia_tier_2 - campaign.rate_ia);
        else if (idx === 2) l.client_commission = Math.max(0, campaign.ia_tier_3 - campaign.ia_tier_2);
      });
    });
  }

  const SHIFTS = [
    ["2026-03-23", 7],
    ["2026-03-24", 6],
    ["2026-03-25", 9],
    ["2026-03-26", 9],
    ["2026-03-27", 11],
    ["2026-03-30", 9],
    ["2026-03-31", 11],
    ["2026-04-01", 9],
    ["2026-04-03", 11],
    ["2026-04-06", 15],
    ["2026-04-07", 15],
    ["2026-04-09", 15],
    ["2026-04-10", 15],
    ["2026-04-13", 17],
    ["2026-04-14", 16],
    ["2026-04-15", 17],
    ["2026-04-16", 16],
    ["2026-04-17", 15],
    ["2026-04-20", 16],
    ["2026-04-21", 11],
    ["2026-04-22", 14],
    ["2026-04-23", 12],
    ["2026-04-24", 11],
    ["2026-04-27", 14],
    ["2026-04-28", 13],
    ["2026-04-29", 13],
    ["2026-04-30", 10],
    ["2026-05-01", 10],
    ["2026-05-04", 13],
    ["2026-05-05", 11],
    ["2026-05-06", 10],
    ["2026-05-07", 12],
    ["2026-05-08", 10],
    ["2026-05-11", 12],
    ["2026-05-12", 12],
    ["2026-05-13", 12],
    ["2026-05-14", 12],
    ["2026-05-15", 11],
  ];
  const shift_logs = SHIFTS.map(([date, agents_on_floor], i) => ({
    id: "sl_" + i, campaign_id: campaign.id, date, agents_on_floor, notes: "",
  }));

  const ATTENDANCE_RAW = [
    ["2026-03-23", ["Arlene", "Gerene", "Jennifer Alobin", "Larabell", "Rein", "Ruel", "Sharon"]],
    ["2026-03-24", ["Arlene", "Gerene", "Jennifer Alobin", "Larabell", "Rein", "Sharon"]],
    ["2026-03-25", ["Arlene", "China (Stephany)", "Divine Grace", "Gerene", "Larabell", "Rein", "Richelle", "Ruel", "Sharon"]],
    ["2026-03-26", ["Arlene", "China (Stephany)", "Divine Grace", "Gerene", "Larabell", "Rein", "Richelle", "Ruel", "Sharon"]],
    ["2026-03-27", ["Arlene", "China (Stephany)", "Dianne", "Gerene", "Irene", "Jha/Allan", "Larabell", "Rein", "Richelle", "Ruel", "Sharon"]],
    ["2026-03-30", ["Arlene", "China (Stephany)", "Dianne", "Gerene", "Jennifer Alobin", "Larabell", "Rein", "Richelle", "Ruel"]],
    ["2026-03-31", ["Arlene", "China (Stephany)", "Dianne", "Gerene", "Jennifer Alobin", "Jha/Allan", "Lily/Shery", "Rein", "Richelle", "Ruel", "Sharon"]],
    ["2026-04-01", ["Arlene", "China (Stephany)", "Gerene", "Jennifer Alobin", "Lily/Shery", "Rein", "Richelle", "Ruel", "Sharon"]],
    ["2026-04-03", ["Arlene", "China (Stephany)", "Dianne", "Gerene", "Jennifer Alobin", "Jha/Allan", "Lily/Shery", "Rein", "Richelle", "Ruel", "Sharon"]],
    ["2026-04-06", ["Arlene", "Aubrey", "Benica", "China (Stephany)", "Irene", "Jarelene", "Jennifer Alobin", "Jha/Allan", "Jhen", "Kemberly", "Lily/Shery", "Rein", "Rhen", "Richelle", "Sharon"]],
    ["2026-04-07", ["Arlene", "Benica", "China (Stephany)", "Dianne", "Irene", "Jennifer Alobin", "Jha/Allan", "Jhen", "Kemberly", "Liz", "Rein", "Rhen", "Richelle", "Ruel", "Sharon"]],
    ["2026-04-09", ["Arlene", "Benica", "China (Stephany)", "Gerene", "Irene", "Jarelene", "Jennifer Alobin", "Jhen", "Kemberly", "Lily/Shery", "Liz", "Rein", "Rhen", "Ruel", "Sharon"]],
    ["2026-04-10", ["Aiza", "Arlene", "Benica", "China (Stephany)", "Gerene", "Irene", "Jarelene", "Jennifer Alobin", "Jomar", "Kemberly", "Lily/Shery", "Liz", "Rein", "Rhen", "Ryan"]],
    ["2026-04-13", ["Aiza", "Arlene", "Benica", "China (Stephany)", "Gerene", "Irene", "Jarelene", "Jennifer Alobin", "Jhen", "Jomar", "Lily/Shery", "Liz", "Rein", "Rhen", "Ruel", "Ryan", "Sharon"]],
    ["2026-04-14", ["Aiza", "Arlene", "Benica", "Gerene", "Irene", "Jarelene", "Jennifer Alobin", "Jhen", "Jomar", "Kemberly", "Lily/Shery", "Liz", "Rein", "Rhen", "Ryan", "Sharon"]],
    ["2026-04-15", ["Aiza", "Arlene", "Benica", "China (Stephany)", "Gerene", "Irene", "Jarelene", "Jennifer Alobin", "Jhen", "Jomar", "Kemberly", "Lily/Shery", "Liz", "Rein", "Rhen", "Ryan", "Sharon"]],
    ["2026-04-16", ["Aiza", "Arlene", "Benica", "China (Stephany)", "Gerene", "Irene", "Jennifer Alobin", "Jhen", "Jomar", "Kemberly", "Lily/Shery", "Liz", "Nikita", "Rein", "Rhen", "Sharon"]],
    ["2026-04-17", ["Aiza", "Arlene", "Benica", "China (Stephany)", "Gerene", "Irene", "Jarelene", "Jennifer Alobin", "Jhen", "Kemberly", "Lily/Shery", "Nikita", "Rein", "Rhen", "Sharon"]],
    ["2026-04-20", ["Aiza", "Arlene", "China (Stephany)", "Gerene", "Irene", "Ivy", "Jarelene", "Jennifer Alobin", "Jhen", "Kemberly", "Lily/Shery", "Mac", "Rein", "Rhen", "Ryan", "Sharon"]],
    ["2026-04-21", ["Arlene", "China (Stephany)", "Gerene", "Irene", "Ivy", "Jennifer Alobin", "Jhen", "Kemberly", "Mac", "Rein", "Ryan"]],
    ["2026-04-22", ["Aiza", "Arlene", "China (Stephany)", "Gerene", "Irene", "Ivy", "Jennifer Alobin", "Jhen", "Kemberly", "Lily/Shery", "Mac", "Rein", "Rhen", "Ryan"]],
    ["2026-04-23", ["Aiza", "Arlene", "China (Stephany)", "Gerene", "Irene", "Ivy", "Jennifer Alobin", "Jhen", "Kemberly", "Lily/Shery", "Mac", "Rein"]],
    ["2026-04-24", ["Aiza", "Arlene", "China (Stephany)", "Gerene", "Ivy", "Jennifer Alobin", "Jhen", "Lily/Shery", "Mac", "Rein", "Rhen"]],
    ["2026-04-27", ["Aiza", "Arlene", "China (Stephany)", "Emil", "Irene", "Ivy", "Jarelene", "Jennifer Alobin", "Keith", "Lily/Shery", "Mac", "Monica", "Rein", "Rhen"]],
    ["2026-04-28", ["Aiza", "Arlene", "China (Stephany)", "Emil", "Gerene", "Irene", "Ivy", "Jarelene", "Jennifer Alobin", "Lily/Shery", "Marites", "Rein", "Rhen"]],
    ["2026-04-29", ["Aiza", "Arlene", "China (Stephany)", "Emil", "Irene", "Ivy", "Jennifer Alobin", "Keith", "Mac", "Marites", "Monica", "Rein", "Rhen"]],
    ["2026-04-30", ["Aiza", "Arlene", "China (Stephany)", "Emil", "Irene", "Ivy", "Jarelene", "Rein", "Rhen", "Ryan"]],
    ["2026-05-01", ["Aiza", "Arlene", "China (Stephany)", "Emil", "Ivy", "Jarelene", "Lily/Shery", "Nikita", "Rein", "Rhen"]],
    ["2026-05-04", ["Aiza", "Arlene", "China (Stephany)", "Emil", "Gerene", "Irene", "Ivy", "Jarelene", "Jennifer Alobin", "Lily/Shery", "Nikita", "Rein", "Rhen"]],
    ["2026-05-05", ["Aiza", "China (Stephany)", "Emil", "Gerene", "Irene", "Ivy", "Jennifer Alobin", "Lily/Shery", "Nikita", "Rein", "Rhen"]],
    ["2026-05-06", ["Aiza", "Arlene", "China (Stephany)", "Emil", "Gerene", "Ivy", "Lily/Shery", "Nikita", "Rein", "Rhen"]],
    ["2026-05-07", ["Aiza", "Arlene", "China (Stephany)", "Emil", "Gerene", "Irene", "Ivy", "Jarelene", "Jennifer Alobin", "Nikita", "Rein", "Rhen"]],
    ["2026-05-08", ["Aiza", "Arlene", "China (Stephany)", "Gerene", "Irene", "Ivy", "Jarelene", "Jennifer Alobin", "Nikita", "Rein"]],
    ["2026-05-11", ["Aiza", "Arlene", "China (Stephany)", "Gerene", "Irene", "Ivy", "Jarelene", "Jennifer Alobin", "Mac", "Nikita", "Rein", "Rhen"]],
    ["2026-05-12", ["Aiza", "Arlene", "China (Stephany)", "Gerene", "Irene", "Jarelene", "Jennifer Alobin", "Jhen", "Mac", "Nikita", "Rein", "Rhen"]],
    ["2026-05-13", ["Aiza", "Arlene", "China (Stephany)", "Gerene", "Irene", "Ivy", "Jennifer Alobin", "Jhen", "Mac", "Nikita", "Rein", "Rhen"]],
    ["2026-05-14", ["Aiza", "Arlene", "China (Stephany)", "Gerene", "Irene", "Ivy", "Jennifer Alobin", "Jhen", "Mac", "Nikita", "Rein", "Rhen"]],
    ["2026-05-15", ["Aiza", "Arlene", "China (Stephany)", "Gerene", "Irene", "Jarelene", "Jennifer Alobin", "Jhen", "Nikita", "Rein", "Rhen"]],
  ];
  const attendance = [];
  let _att_id = 1;
  ATTENDANCE_RAW.forEach(([date, names]) => {
    names.forEach(name => {
      const agent = nameToAgent[resolveName(name)];
      if (!agent) return;
      attendance.push({
        id: "att_" + (_att_id++),
        campaign_id: campaign.id,
        agent_id: agent.id,
        date,
        status: "present",
        auto_detected: false,
      });
    });
  });

  const profile = {
    id: "u_self", full_name: "Derek", initials: "D", role: "admin", email: "derek@homerelief.io",
  };

  const users = [{
    id: "u_self", initials: "D", full_name: "Derek", email: "derek@homerelief.io",
    role: "admin", campaign_ids: [campaign.id], status: "active",
    last_active: new Date(TODAY).toISOString(),
    created_at: "2026-03-20T09:00:00.000Z",
  }];

  const audit_log = [{
    id: "au_1", ts: "2026-03-20T09:00:00.000Z",
    actor_id: "u_self", actor_name: "Derek",
    kind: "campaign.create", category: "campaigns",
    campaign_id: campaign.id, campaign_name: campaign.name,
    description: `Created campaign “${campaign.name}” for ${campaign.client}`,
  }];

  window.MOCK_DATA = {
    campaigns: [campaign], agents, leads, shift_logs, attendance,
    profile, users, audit_log, today: dayStr(TODAY),
    // Bump this whenever the seed (agents/leads/etc.) changes — the app
    // discards a saved blob from an older seed and re-seeds from here.
    seedVersion: 3,
  };
  window.MOCK_TODAY = TODAY;
})();
