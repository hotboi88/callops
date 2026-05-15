// Home Relief campaign — VERIFIED seed data (v3)
// 350 leads · Mar 23 – May 14, 2026
// Client product: ADU, JADU, Garage Conversions, Room Additions
// Rates: IA=$15, Confirmed=$0, Transfer=$0, IA tier-2=$40, IA tier-3=$75
// Status reflects LATEST announced status per the chat log (Derek's confirmation/IA/DNC announcements).

(function () {
  const TODAY = new Date(2026, 4, 15); // May 15, 2026 (Friday)
  function dayStr(d) {
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + dd;
  }
  let _uid = 1; const uid = () => "id_" + (_uid++);

  // ---- The single campaign ----
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

  // ---- Agents ----
  // [name, is_tl, assigned_tl_name, status]
  // Active 16: Arlene & Stephany are TLs. Others currently active without prior lead history are listed here.
  // Inactive agents are kept for historical lead attribution.
  const AGENT_DEFS = [
    // Active roster (16)
    ["Arlene Pernez",            true,  null,             "active"],
    ["Stephany Duran",           true,  null,             "active"],
    ["Rhen Esmen",               false, "Stephany Duran", "active"],
    ["Jarelene Esmen",           false, null,             "active"],
    ["Gerardo Je Lay Tanudra",   false, null,             "active"],
    ["Ryan Nikita Gonzales",     false, null,             "active"],
    ["Ivy Cuizon",               false, null,             "active"],
    ["Gerene Joy Panagsagan",    false, "Arlene Pernez",  "active"],
    ["Ronald Rey Bambao",        false, "Stephany Duran", "active"],
    ["Jennifer Luzon",           false, null,             "active"],
    ["Jennifer Alobin",          false, "Stephany Duran", "active"],
    ["Allain Macam",             false, "Stephany Duran", "active"],
    ["Aiza Tugaon",              false, null,             "active"],
    ["Myrra Ligsay",             false, null,             "active"],
    ["Mark Dela Cruz",           false, null,             "active"],
    ["Paul Brandon Jaculina",    false, null,             "active"],
    // Inactive — historical lead attribution only
    ["Shery Redoble",            false, null,             "inactive"],
    ["Sharon",                   false, null,             "inactive"],
    ["Richelle",                 false, null,             "inactive"],
    ["Dianne",                   false, null,             "inactive"],
    ["Emil",                     false, null,             "inactive"],
    ["Ruel",                     false, null,             "inactive"],
    ["Irene",                    false, null,             "inactive"],
    ["Benica",                   false, null,             "inactive"],
    ["Jha/Allan",                false, null,             "inactive"],
    ["Liz",                      false, null,             "inactive"],
    ["Keith",                    false, null,             "inactive"],
    ["Kemberly",                 false, null,             "inactive"],
    ["Jomar",                    false, null,             "inactive"],
    ["Divine Grace",             false, null,             "inactive"],
    ["Ana M",                    false, null,             "inactive"],
    ["Aubrey",                   false, null,             "inactive"],
    ["Larabell",                 false, null,             "inactive"],
    ["Marites",                  false, null,             "inactive"],
    ["Monica",                   false, null,             "inactive"],
    ["Jhen",                     false, null,             "inactive"],
  ];

  // Aliases: old/short names in the lead seed → canonical agent
  const ALIASES = {
    "Arlene":            "Arlene Pernez",
    "China (Stephany)":  "Stephany Duran",
    "Rein":              "Ronald Rey Bambao",
    "Rhen":              "Rhen Esmen",
    "Jarelene":          "Jarelene Esmen",
    "Gerardo Tanudra":   "Gerardo Je Lay Tanudra",
    "Jelay":             "Gerardo Je Lay Tanudra",
    "Ryan":              "Ryan Nikita Gonzales",
    "Nikita":            "Ryan Nikita Gonzales",
    "Ivy":               "Ivy Cuizon",
    "Gerene":            "Gerene Joy Panagsagan",
    "Gerene Panagsagan": "Gerene Joy Panagsagan",
    "Aiza":              "Aiza Tugaon",
    "Lily/Shery":        "Shery Redoble",
    "Mac":               "Allain Macam",
  };
  function resolveName(name) { return ALIASES[name] || name; }

  // Agents hired May 15, 2026 (today). All others started at campaign launch.
  const NEW_HIRES = new Set(["Myrra Ligsay", "Mark Dela Cruz", "Paul Brandon Jaculina"]);

  const nameToAgent = {};
  const agents = AGENT_DEFS.map(([name, is_tl, _tl, status], i) => {
    const a = {
      id: "ag_" + i,
      campaign_id: campaign.id,
      full_name: name,
      agent_number: "A" + (1001 + i),
      status,
      is_tl,
      date_added: NEW_HIRES.has(name) ? "2026-05-15" : "2026-03-20",
    };
    nameToAgent[name] = a;
    return a;
  });
  agents.forEach((a, i) => {
    const [, , tlName] = AGENT_DEFS[i];
    a.assigned_tl_id = tlName ? nameToAgent[tlName]?.id || null : null;
  });

  // ---- Leads (v3 verified) ----
  // Format: date | time | agent | customer | phone | address | project | appt_date | appt_time | status | client$ | spiff | tl_bonus | tl_recipient | remarks
  const LEADS_RAW = `
2026-03-23 | 11:15 | Rein | Kyler Sawicki | (805) 443-0282 | 1787 Ridgewood Dr, Camarillo, CA 93012 |  | Today | 11:00 AM (PST) | transfer | 0 | 0 | 0 | — | Customer is the decision-maker.
2026-03-23 | 16:04 | Gerene | Barbara Baumann | (909) 989-3035 | 10993 Wilderness Dr, Rancho Cucamonga, CA 91737 | ADU (Half Acre Land) | March 27, 2026 | 10:00 AM (PST) | transfer | 0 | 0 | 0 | — | Interested in building an ADU for additional privacy on her half-acre property.
2026-03-24 | 10:36 | Arlene | ALLEN FAIRCHILD | (626) 437-0898 | 4138 Richwood Ave El Monte, CA 91732 |  | March 24 | 1 PM | transfer | 0 | 0 | 0 | — | He and his wife are the decision makers; wife will be present.
2026-03-24 | 13:05 | Rein | EDWARD MANDERS | (626) 278-1263 | 2865 Foss Ave Arcadia CA 92377 |  | Monday | 1 | transfer | 0 | 0 | 0 | — | Need to speak to his wife. Customer is the decision-maker.
2026-03-25 | 10:00 | China (Stephany) | Angela Sharbino |  |  |  |  |  | ia | 15 | 5 | 0 | — | Manually added — confirmed in chat
2026-03-25 | 10:00 | Ruel | Maria/Cesar Garcia |  |  |  |  |  | ia | 15 | 5 | 0 | — | Manually added — confirmed in chat
2026-03-25 | 10:09 | Divine Grace | Alexander Echeverry | (562) 250-6167 | 6611 11th Avenue, Los Angeles, CA 90043 |  | March 26, 2026 | 11AM | transfer | 0 | 0 | 0 | — | 
2026-03-25 | 12:51 | Sharon | Luis Hernandez | (909) 910-2912 | 1557 N Pershing Ave |  | Today | 5 PM (PST) | dnc | 0 | 0 | 0 | — | Customer is the decision-maker.
2026-03-25 | 17:33 | China (Stephany) | joe huzman | (562) 761-3124 | 5634 Mesagrove Ave |  | 03/26/26 | 5pm | pending | 0 | 0 | 0 | — | Interested in ADU; agreed for appt tomorrow after 5pm.
2026-03-26 | 09:13 | Rein | KENNETH SPOLOWITZ | (213) 505-8693 | 10520 Mary Ave Los Angeles CA 90002 |  | Mar 27 | 6 | confirmed | 0 | 10 | 0 | — | Already has one 5 yrs ago but wants another. Wife is also a decision maker; available around 7 in the evening.
2026-03-26 | 09:30 | Arlene | Juan Cruz | (323) 481-7379 | 1408 E 76th Pl Los Angeles CA 90001 |  | March 26 | 3pm | ia | 15 | 5 | 0 | — | Interested in adding a garage; speaks limited English (Spanish preferred). HO and decision maker.
2026-03-26 | 10:33 | Arlene | CAROLYN PEARSON | (562) 417-9107 | 15421 Stevens Avenue Bellflower CA 90706 |  | Today | 2pm | transfer | 0 | 0 | 0 | — | Interested in cost. HO and decision maker. Call dropped; successfully transferred on callback.
2026-03-26 | 12:27 | Arlene | MR.ZIMMERMAN | (818) 324-0932 | 22393 Cass Ave Woodland Hills CA 91364 |  |  |  | transfer | 0 | 0 | 0 | — | Interested in a garage but asked for license # before confirming time. HO and decision maker.
2026-03-26 | 12:27 | China (Stephany) | john vigilan | (323) 855-9459 | 3801 Sutro Ave |  | 03/26/26 | 6pm | pending | 0 | 0 | 0 | — | Interested in garage conversion. Asked for callback.
2026-03-27 | 10:12 | China (Stephany) | bomberreli | (310) 328-9261 | 20951 Brighton Ave, Torrance, CA 90501 |  | 03/27/2026 |  | transfer | 0 | 0 | 0 | — | 
2026-03-27 | 12:33 | Ana M | SYLVIA PACHECO | (562) 332-3447 | 9121 Bluford Ave |  | March 27 2026 | 2PM | transfer | 0 | 0 | 0 | — | Lead doesn't want to be transferred; wants to just wait for the assessor at 2pm.
2026-03-27 | 14:26 | China (Stephany) | KONRAD HREHOROWICZ | (310) 463-8094 | 1224 E Villa St, Pasadena, CA 91106 |  | 03/27/2026 |  | pending | 0 | 0 | 0 | — | 
2026-03-27 | 18:02 | Jha/Allan | Carlos Garcia/Linda Garcia | (978) 815-4880 | 1813 Valona Dr Baldwin Park CA 91706 |  | March 30 2026 | 2 PM | pending | 0 | 0 | 0 | — | HO and decision maker (Mr. Carlos Garcia).
2026-03-30 | 09:49 | Jennifer Alobin | Shahla Makaabi | (310) 871-1175 | 13532 Beverly Blvd Whittier CA 90601 | ADU back of her house | 03/30/26 | 12PM | transfer | 0 | 0 | 0 | — | Received gov't funds for ADU but hasn't spoken to anyone yet; wants a specialist first.
2026-03-30 | 11:06 | Jennifer Alobin | Amanda Jordan | (424) 221-4495 | 4606 Olanda St Lynwood CA 90262 | JADU | April 3, 2026 | 2pm | transfer | 0 | 0 | 0 | — | Couldn't transfer; advised confirmer will call. Sole HO.
2026-03-30 | 12:17 | China (Stephany) | ROSEMARIE FOTI | (310) 218-9661 | 20951 Brighton Ave, Torrance, CA 90501 |  | 03/30/2026 |  | transfer | 0 | 0 | 0 | — | 
2026-03-30 | 14:41 | China (Stephany) | DENNIS SENYONJO | (818) 602-6123 | 25611 Palma Alta Dr, Valencia, CA 91354 |  | 03/30/2026 |  | transfer | 0 | 0 | 0 | — | Interested in income.
2026-03-30 | 16:01 | Arlene | Johanna Prewett | (951) 858-7653 | 3906 York Blvd Los Angeles CA 90065 |  | March 31 | 5PM | pending | 0 | 0 | 0 | — | Interested; agreed for tomorrow. Transfer line not working — please call back.
2026-03-30 | 16:30 | Gerene | Damazo Soriano | (310) 293-2545 | 945 E 54th St Los Angeles CA 90011 |  | 3/31/2026 |  | transfer | 0 | 0 | 0 | — | Interested with ADU; educated to call back tomorrow for specialist.
2026-03-30 | 16:44 | Arlene | Timothy Darsarran | (562) 201-0136 | 13903 Walnut St Whittier 90602 |  | March 31 | 1:30 PM | pending | 0 | 0 | 0 | — | Agreed for appt tomorrow afternoon 1:30pm — please call back.
2026-03-30 | 17:33 | Rein | JAVIER SIXTO | (323) 617-6845 | 2607 E 131st St, Compton, CA 90222 |  | 03/31/2026 | 9:30-10am | pending | 0 | 0 | 0 | — | Wants to know cost for ADU painting and roofing. HO; Spanish preferred.
2026-03-31 | 10:00 | Arlene | Donna |  |  |  |  |  | ia | 15 | 5 | 0 | — | Manually added — confirmed in chat
2026-03-31 | 11:30 | Jha/Allan | Salvatorie Viola | (818) 963-1621 | 9301 Swinton Ave North Hills CA 91343 |  | Today | 1pm | transfer | 0 | 0 | 0 | — | 
2026-03-31 | 11:42 | Jha/Allan | Hugh Rodriguez | (714) 499-1570 |  |  | Today | 1pm | transfer | 0 | 0 | 0 | — | Can't provide address but interested.
2026-03-31 | 12:40 | Arlene | DAVID | (469) 855-8788 | 1331 Highland Ave Glendale CA 91202 |  | Today | 5pm | transfer | 0 | 0 | 0 | — | Confirmed appt at 5pm; transfer line not working; called back; transferring.
2026-03-31 | 15:18 | China (Stephany) | GERARDO- DELUERA | (818) 403-1869 | 13507 Rayben St, Sylmar, CA 91342 |  | 04/01/26 |  | ia | 15 | 10 | 0 | — | 
2026-03-31 | 17:55 | Lily/Shery | BRITTANY PRYOR | (323) 770-8247 | 1220 E 87th St, Los Angeles, CA 90002 |  | 04/01/2026 | 1pm | pending | 0 | 0 | 0 | — | Interested in ADU; tagged as callback (no available specialist to transfer).
2026-03-31 | 19:01 | Arlene | Ken Cash | (213) 447-4852 | 24001 Banning Blvd Carson 90745 |  | April 1 | 4-5pm | pending | 0 | 0 | 0 | — | Interested in SB-9 (subdivide 2 houses into 20). Wants callback before appt.
2026-04-01 | 09:07 | China (Stephany) | ROCKY TAN | (626) 905-3084 | 2563 Leebe Ave, Pomona, CA 91768 |  | 04/01/2026 | 1pm | ia | 15 | 5 | 0 | — | 
2026-04-01 | 09:57 | Jennifer Alobin | Alexander Echeverry | (562) 250-6167 | 6611 11th Avenue, Los Angeles, CA 90043 | ADU | Today | 2 hrs | transfer | 0 | 0 | 0 | — | Successful transfer.
2026-04-01 | 10:00 | Sharon | Michael Garcia |  |  |  |  |  | confirmed | 0 | 15 | 0 | — | Manually added — confirmed in chat
2026-04-01 | 10:26 | Ruel | PEDRO GONZALEZ | (626) 230-8616 |  |  | 04/01/2026 | 1PM | ia | 15 | 5 | 0 | — | 
2026-04-01 | 10:37 | Lily/Shery | SAMUEL CLARIDA | (562) 505-6342 | 1345 W Central Ave, Brea, CA 92821 |  | 04/03/2026 | 1pm | confirmed | 0 | 0 | 0 | — | 
2026-04-01 | 14:42 | Ruel | DEBORAH WEST | (626) 833-2634 | 200 Chinchilla St, La Habra, CA 90631 |  | 04/01/2026 | 11AM | transfer | 0 | 0 | 0 | — | 
2026-04-01 | 14:47 | Rein | RAYMOND GARCIA | (562) 685-6373 | 2909 Yearling St, Lakewood, CA 90712 |  | 04/03/2026 | 8-9am | transfer | 0 | 0 | 0 | — | Set appt Sunday 11am.
2026-04-01 | 17:13 | Irene | Jeffrey Kang | (770) 377-1800 | 5918 Ocean Terrace Dr |  | April 3 | 2pm | pending | 0 | 0 | 0 | — | Interested in ADU.
2026-04-01 | 17:17 | Lily/Shery | ROBERT SHAW | (818) 640-1742 | 1745 Thurber Pl, Burbank, CA 91501 |  | 04/03/2026 | 1pm | pending | 0 | 0 | 0 | — | HO is his son; son currently out of town. Rescheduled callback on Sunday.
2026-04-01 | 18:02 | Richelle | SARAH LEE | (805) 499-4150 | 3812 San Nicolas Ct, Newbury Park, CA 91320 |  | 04/03/2026 | 2PM | pending | 0 | 0 | 0 | — | 
2026-04-03 | 09:31 | Jha/Allan | WILFREDO MARTINEZ | (323) 305-3709 | 604 W 43rd St, Los Angeles, CA 90037 |  | 04/03/2026 |  | transfer | 0 | 0 | 0 | — | 
2026-04-03 | 09:34 | Gerene | SARA PALAZZOLA | (714) 623-4669 | 5624 Tower Rd Riverside CA 92506 |  | 4/3/2026 | 5 PM | transfer | 0 | 0 | 0 | — | Off to work; wants specialist at house at 5pm.
2026-04-03 | 09:50 | Jha/Allan | SALLY CHOI | (213) 270-4787 | 15309 S Wilton Pl, Gardena, CA 90249 |  | 04/03/2026 | 1:00PM | transfer | 0 | 0 | 0 | — | 
2026-04-03 | 09:54 | China (Stephany) | IGNACIO LOPEZ | (562) 325-4588 | 4139 Maris Ave, Pico Rivera, CA 90660 |  | 04/06/2026 | 1pm | transfer | 0 | 0 | 0 | — | 
2026-04-03 | 10:35 | Irene | Rudy LUEVANO | (626) 922-2943 | 216 S Armel Ave |  | April 3, 2026 | 10am | transfer | 0 | 0 | 0 | — | Interested in ADU.
2026-04-03 | 11:04 | Jha/Allan | Paul Parilla | (909) 913-1277 | 6190 Morning Rancho Cucamonga, CA 91737 |  | 04/03/2026 | 3:00PM | dnc | 0 | 0 | 0 | — | 
2026-04-03 | 11:21 | China (Stephany) | alex ortiz | (626) 252-8361 | 11451 Elmcrest St, El Monte, CA 91732 |  | 04/06/2026 |  | transfer | 0 | 0 | 0 | — | 
2026-04-03 | 14:12 | China (Stephany) | SHIRLEY BEE | (951) 924-0397 | 9109 Mines Ave, Pico Rivera, CA 90660 |  | 04/05/2026 | 3pm | pending | 0 | 0 | 0 | — | 
2026-04-03 | 14:26 | Jennifer Alobin | Dennis Senyonjo | (818) 602-6123 | 25611 Palma Alta Dr, Valencia, CA 91354 | JADU | 4/6/2026 Monday | 10am | pending | 0 | 0 | 0 | — | Wants to know more; callback requested. Said he only needs funding — declined appt.
2026-04-03 | 14:45 | Jennifer Alobin | Irma Fernandez | (626) 808-6373 | 415 Redfield Ave Los Angeles CA 90042 | ADU | 4/6/2026 | 2-3pm | pending | 0 | 0 | 0 | — | HO interested; callback.
2026-04-03 | 14:46 | Arlene | ROMAN JANIEC | (626) 523-0888 | 1154 N Glendora Ave Glendora CA 91741 |  | April 6 | 11AM | pending | 0 | 0 | 0 | — | Remodeling/rebuilding. Agreed visit Monday. Called 3x left VM.
2026-04-03 | 14:49 | Rein | DAVID/MARTHA OLIVAS | (915) 630-1672 | 22210 Roundup Dr, Walnut, CA 91789 |  | 04/06/2026 | 10 | pending | 0 | 0 | 0 | — | Both HOs. Callback requested before 10am Sunday.
2026-04-03 | 15:38 | Richelle | paramjit hans | (209) 324-7727 | 6777 Daryn Dr W Hill 91307 |  | 04/06/2026 | 9:30 AM | confirmed | 0 | 0 | 0 | — | Callback Monday. CONFIRMED.
2026-04-03 | 15:42 | Jennifer Alobin | Elaine Paredes | (323) 788-0880 | 11832 Peak Rd Chatsworth CA 91311 | ADU | 4/6/2026 Monday | 10am | confirmed | 0 | 0 | 0 | — | Interested in adding a unit. CONFIRMED.
2026-04-03 | 16:31 | Jennifer Alobin | Edith Lascola | (760) 902-1673 | 68081 Corta Rd Cathedral CA 92234 | ADU | Monday 4/6/26 | 10am | pending | 0 | 0 | 0 | — | Cathedral City is outside coverage area.
2026-04-03 | 16:56 | Richelle | UCHECHI NKWOCHA | (909) 569-9679 | 10396 Spade Dr, Loma Linda, CA 92354 |  | 04/06/2026 | 10:00 AM | pending | 0 | 0 | 0 | — | Wants to know more about the program.
2026-04-03 | 17:01 | Arlene | Shabnum Husain | (714) 206-8407 | 3825 Fremont Dr Corona CA 92881 |  | Monday | 6pm | confirmed | 0 | 0 | 0 | — | Retired; interested for rental income. HO/DM. CONFIRMED.
2026-04-03 | 17:06 | Jennifer Alobin | Dorothy Vinson | (909) 626-3763 | 1128 E La Verne Ave Pomona 91767 | ADU | Monday 4/6 | 2:30-3pm | confirmed | 0 | 0 | 0 | — | Interested in program. CONFIRMED.
2026-04-03 | 17:12 | Irene | S ARKIS VARSBED | (818) 369-7043 | 2920 Hopeton Rd La Crescenta CA |  | April 6, 2026 | 2PM | pending | 0 | 0 | 0 | — | Interested in ADU.
2026-04-03 | 17:33 | China (Stephany) | MARIA DEL PILAR IRASTORZA | (323) 359-2191 | 6520 Alamo Avenue Bell CA, Cudahy, CA 90201 |  | 04/06/2026 |  | pending | 0 | 0 | 0 | — | 
2026-04-03 | 17:46 | Rein | Angel / ROSA BUSTONS | (323) 357-2602 | 464 S Woods Ave, Los Angeles, CA 90022 |  | 04/13/2026 | 10-11am | pending | 0 | 0 | 0 | — | Planning two-bedroom unit. HO/DM. Credit score too low.
2026-04-03 | 17:53 | Lily/Shery | JENNIFER GARCIA | (714) 728-9420 | 421 N 12th St, Montebello, CA 90640 |  | 04/06/2026 | 1pm | pending | 0 | 0 | 0 | — | Not a homeowner; requested DNC on Friday.
2026-04-06 | 09:10 | Arlene | Ventura Madrigal | (562) 595-2349 | 34 Savona Walk Long Beach CA 90803 |  | Today | 1pm | transfer | 0 | 0 | 0 | — | 
2026-04-06 | 09:55 | Jhen | WILLIAM WEBB | (818) 383-1734 | 3090 Triunfo Canyon Rd CA |  | Today | 1pm | ia | 15 | 0 | 0 | — | CONFIRMED — $15 for an IA.
2026-04-06 | 10:00 | Arlene | Vickie Mendez |  |  |  |  |  | ia | 15 | 0 | 0 | — | Manually added — confirmed in chat
2026-04-06 | 10:00 | Dianne | David Zuniga |  |  |  |  |  | confirmed | 0 | 0 | 0 | — | Manually added — confirmed in chat
2026-04-06 | 10:02 | Jennifer Alobin | Sandra Argueta speak to husband | (213) 820-7795 | 1231 S Wilton Pl Los Angeles CA 90019 | ADU | 4/7 Tuesday | 2pm | transfer | 0 | 0 | 0 | — | Speak to Mr. Argueta — HO/DM interested with ADU.
2026-04-06 | 10:05 | Aubrey | Tommy Morgan | (323) 296-4360 | 90043 LA Card CA |  | Today | 12-2pm | transfer | 0 | 0 | 0 | — | He is HO planning to add ADU. Dialer name is his mother's.
2026-04-06 | 10:20 | Arlene | VICKIE MENDEZ | (562) 201-7470 | 658 S Rowan Ave Los Angeles |  | Today | 2pm | transfer | 0 | 0 | 0 | — | 
2026-04-06 | 10:33 | Jennifer Alobin | Jose Lopez | (818) 573-3659 | 9119 Wakefield Ave Panorama 91402 | ADU | 4/7 Tuesday | 3:30pm | transfer | 0 | 0 | 0 | — | Successful transfer; spoke to Mrs. Lopez.
2026-04-06 | 11:48 | Irene | MALAK KAMEL | (760) 508-7409 | 14605 Golden Trl Victorville CA | ADU | 4/7 Tuesday | 3:00pm | transfer | 0 | 0 | 0 | — | Interested in ADU.
2026-04-06 | 12:05 | China (Stephany) | CARLOS GOMEZ | (323) 816-6504 | 4909 Templeton St, Los Angeles, CA 90032 |  | 04/06/2026 | 5PM | transfer | 0 | 0 | 0 | — | 
2026-04-06 | 12:17 | Irene | christopher Sandoval | (323) 793-5219 | 1345 W 36 Pl Los Angeles California 9007 | ADU | April 6, 2026 | 6pm | transfer | 0 | 0 | 0 | — | 
2026-04-06 | 12:18 | Jarelene | david zuniga | (909) 534-7431 | 26764 13th St | ADU | 4/7/2026 | 4pm | transfer | 0 | 0 | 0 | — | Interested in ADU; transferring.
2026-04-06 | 12:39 | Arlene | QUEEN STANCH |  | 10928 S Osage Ave, Inglewood, CA 90304 |  | Today | 3pm | transfer | 0 | 0 | 0 | — | 
2026-04-06 | 12:44 | Lily/Shery | GUADALUPE MARTINEZ | (323) 833-5438 | 241 E 60th St, Los Angeles, CA 90003 |  | 04/06/2026 | 4-5pm | pending | 0 | 0 | 0 | — | Not the HO; lives there since the owner (brother) is now living elsewhere.
2026-04-06 | 12:55 | China (Stephany) | RICARDO ENRIQUEZ | (909) 210-0469 | 6655 Ohare Ct, Fontana, CA 92336 |  | 04/06/2026 | 5PM | transfer | 0 | 0 | 0 | — | 
2026-04-06 | 14:10 | Rein | FEDERICO HYAMS | (909) 322-4480 | 1267 Glenclaire Dr, Walnut, CA 91789 |  | 04/07/2026 | 10-11 | transfer | 0 | 0 | 0 | — | 
2026-04-06 | 14:55 | Irene | Jason Prada | (909) 277-5294 | 25941 9th St Apartment 20 San Bernardino | ADU | April 6, 2026 | 6pm | transfer | 0 | 0 | 0 | — | 
2026-04-06 | 15:52 | China (Stephany) | JONES HARRISON | (323) 756-2567 | 2113 Lohengrin St, Los Angeles, CA 90047 |  | 04/06/2026 | 5pm | transfer | 0 | 0 | 0 | — | 
2026-04-06 | 16:52 | Lily/Shery | jonah |  | 11170 Mountain View Ave, San Bernardino, CA 92354 |  | 04/06/2026 |  | transfer | 0 | 0 | 0 | — | Anonymous.
2026-04-06 | 17:01 | Dianne | rimon carapet | (818) 956-7537 | 91205 Glendale CA |  | 04/07/2026 | 7PM | pending | 0 | 0 | 0 | — | Mom is HO; son is DM. She will give number to son.
2026-04-07 | 09:25 | Jha/Allan | SERGIO GARCIA | (323) 677-8482 | 3209 W Washington, Los Angeles, CA 90019 |  | 04/07/2026 | 3PM | transfer | 0 | 0 | 0 | — | 
2026-04-07 | 09:33 | Jhen | SALVADOR GONZALEZ |  | 3926 Summit Dr CA 90602 | ADU | 4/7/26 | 1pm | transfer | 0 | 0 | 0 | — | 
2026-04-07 | 11:57 | Jhen | MARIA DUVAL | (323) 439-9286 | 1134 W 69 St Los Angeles CA 90044 |  | Today | 3PM | transfer | 0 | 0 | 0 | — | 
2026-04-07 | 12:15 | China (Stephany) | SEAN GOLLER | (201) 421-8395 | 4321 Kingswell Ave, Los Angeles, CA 90027 |  | 04/07/2026 | 3pm | ia | 15 | 10 | 0 | — | 
2026-04-07 | 12:36 | Irene | Tommy Blackwelder |  | 5811 Pine Canyon Dr Bakersfield | ADU | April 7, 2026 | ongoing | transfer | 0 | 0 | 0 | — | Interested in ADU; transferring.
2026-04-07 | 13:02 | Liz | DOUGLAS MOTLEY | (909) 338-3557 | PO Box 6032 Crestline CA 92325 |  | Today | 3 PM | transfer | 0 | 0 | 0 | — | 
2026-04-07 | 14:38 | Dianne | BRIAN HALVERSON | (951) 361-2244 | 15724 Lucky Horse Lane Parker CA |  | 04/09/2026 | 1PM | transfer | 0 | 0 | 0 | — | Interested in ADU.
2026-04-07 | 15:13 | Dianne | SANDRA FINLEY | (909) 242-2084 | 11996 Weller Pl Moreno Valley CA |  | 04/09/2026 | 1PM | transfer | 0 | 0 | 0 | — | Interested in ADU.
2026-04-07 | 15:57 | Rhen | Felicia Toloza | (562) 743-6847 | 11537 Elvins St, Lakewood, CA 90715 |  | April 9 | 11am | confirmed | 0 | 10 | 0 | — | Interested in ADU.
2026-04-07 | 16:02 | Rein | AGUSTIN TOLENTINO | (310) 878-7993 | 748 East 135th Street, Los Angeles, CA 90059 |  | 04/09/2026 | 11am | confirmed | 0 | 10 | 0 | — | 13430 S New Hampshire Ave Gardena 90247 — wants ADU at this address.
2026-04-07 | 18:10 | Rhen | Eric Sanchez | (909) 331-1460 | 6617, Rancho Cucamonga CA, 91739 |  | April 9 | 3pm | pending | 0 | 0 | 0 | — | Interested; CB for transfer on Thursday.
2026-04-09 | 10:37 | Rein | VENKATESH NATARAJAN | (716) 491-7507 | 127 W Norgate St, Glendora, CA 91740 |  | 04/09/2026 | 2pm | ia | 15 | 0 | 0 | — | 
2026-04-09 | 10:39 | Gerene | NICHOLE SANCHEZ JESUS | (661) 675-7323 | 39533 171st St E, Palmdale, CA 93591 |  | 4/9/2026 | Anytime | ia | 15 | 0 | 0 | — | Interested in ADU; speaks Spanish and English. Wants specialist visit.
2026-04-09 | 11:01 | Jennifer Alobin | John Min | (714) 369-0150 | 12610 Marywhite St El Monte Ca 91732 | ADU | 4/9 Today | 2pm | ia | 15 | 0 | 0 | — | Transferred.
2026-04-09 | 11:01 | Arlene | MARCOS PEREZ | (323) 434-5730 | 11014 Coolhurst Dr Whittier CA 90606 |  | Today | 2:00 pm | confirmed | 0 | 15 | 0 | — | Transferring.
2026-04-09 | 11:02 | Benica | MANUEL PINON | (626) 667-1567 | 17350 W Temple Sp 295, La Puente, CA 91744 |  | 04/09/2026 |  | transfer | 0 | 0 | 0 | — | 
2026-04-09 | 11:40 | Arlene | Crispin Gonzalez | (310) 631-5908 | 3338 Alma Ave |  | Today | 3pm | transfer | 0 | 0 | 0 | — | 
2026-04-09 | 12:53 | Irene | Gorge :VLAHAKIS | (661) 340-2335 | 1911 Kentucky St Bakersfield |  | April 9, 2026 | tom 1-6 | transfer | 0 | 0 | 0 | — | Interested in garage ADU.
2026-04-09 | 15:06 | Liz | TERRY GIMENEZ | (818) 424-2268 | 1220 Hillcrest Ave. Pasadena California |  | Today | 4:35 PM | transfer | 0 | 0 | 0 | — | Transferring.
2026-04-09 | 15:38 | Gerene | ANNETT  DEANFRASIO | (818) 709-2147 | 20159 Londelius St Canoga Park CA 91306 |  | 4/10/2026 | 4-5pm | confirmed | 0 | 5 | 0 | — | Interested in ADU; agreed visit tomorrow.
2026-04-09 | 16:35 | Liz | CALEB LOPEZ | (209) 262-0050 | 7305 Anne Cir, Winton, CA 95388 |  | Tomorrow | 5 PM | transfer | 0 | 0 | 0 | — | 
2026-04-09 | 17:05 | Irene | Jason Grahan | (310) 629-9903 |  |  | April 10, 2026 | 2pm | pending | 0 | 0 | 0 | — | Interested in ADU.
2026-04-09 | 17:28 | Jarelene | ashgy lujan | (562) 200-8937 | 10414 Mapledale St, Bellflower, CA 90706 |  | Tomorrow | 9am | pending | 0 | 0 | 0 | — | Wants appt after learning more about funding/programs. CB tomorrow 9am.
2026-04-09 | 17:36 | Rhen | ANNETT DEANFRAS | (818) 709-2147 | 20159 Londelius St Canoga Park |  | Tomorrow | 2-3pm | pending | 0 | 0 | 0 | — | Interested in ADU; CB tomorrow for transfer.
2026-04-09 | 17:39 | Rein | ROHELIO VILLANUEVA | (805) 876-6134 | 14445 Avenida Colonia, Moorpark, CA 93021 |  | 04/10/2026 | 11am | pending | 0 | 0 | 0 | — | 
2026-04-09 | 18:00 | Liz | IVA CAHILL | (424) 558-8146 | 1004 Sierra Place CA 90503 |  | Tomorrow | Anytime | pending | 0 | 0 | 0 | — | Callback tomorrow.
2026-04-09 | 18:26 | Lily/Shery | trevis / carrie canto | (323) 377-0115 | 1643 W 60th St, Los Angeles, CA |  | Tomorrow | 10am | pending | 0 | 0 | 0 | — | Carrie is wife of property owner; interested in ADU. Callback once husband home.
2026-04-10 | 10:00 | Aiza | Donald Maedel |  |  |  |  |  | confirmed | 0 | 10 | 0 | — | Manually added — confirmed in chat
2026-04-10 | 10:00 | Rein | Raymond Garcia |  |  |  |  |  | confirmed | 0 | 0 | 0 | — | Manually added — confirmed in chat
2026-04-10 | 10:01 | Aiza | Donald Maesel | (909) 377-3912 | 254 N Laurel Ave, Upland, CA 91786 |  |  |  | transfer | 0 | 0 | 0 | — | ADU.
2026-04-10 | 10:11 | Jennifer Alobin | Harris Carmack | (323) 934-3384 | 5728 Brynhurst Ave Los Angeles Ca 90043 | ADU | Today | 3-4pm | transfer | 0 | 0 | 0 | — | Transferring.
2026-04-10 | 10:35 | Lily/Shery | MARTHA OLMOS | (714) 642-8585 | 2429 Folsom St, Los Angeles, CA 90033 |  | 04/11/2026 |  | pending | 0 | 0 | 0 | — | In a rush but interested; callback tomorrow 1pm.
2026-04-10 | 12:08 | Rhen | Zakir Khan | (626) 391-2500 | 6715 Mclennan Ave |  | April 10 | 5pm | transfer | 0 | 0 | 0 | — | Interested in ADU.
2026-04-10 | 12:18 | Liz | EDGAR RUIZ-SALAZAR | (760) 596-8045 | 12477 Flagstone Ct CA 92392 |  | Today | 6 PM | transfer | 0 | 0 | 0 | — | Transferring.
2026-04-10 | 12:31 | Gerene | JASON GRANT | (310) 629-9903 | 2800 Buckingham Rd, Los Angeles, CA 90016 |  | 4/10/2026 | Anytime today | transfer | 0 | 0 | 0 | — | Wants me to transfer to specialist for info; interested in ADU.
2026-04-10 | 12:33 | Irene | BiNH NGUYEN | (714) 683-3867 | 1105 W Park Ave Anaheim CA |  | April 9, 2026 | 3PM | transfer | 0 | 0 | 0 | — | Interested in ADU; wants inspection tomorrow.
2026-04-10 | 12:43 | Rhen | Max Hampton | (805) 304-1333 | 309 Sinaloa Rd |  | April 10 | 2pm | transfer | 0 | 0 | 0 | — | Interested in ADU.
2026-04-10 | 15:58 | Benica | SHERI DUNNER | (310) 404-6661 | 1489 Bienveneda Ave, Pacific Palisades, CA 90272 |  | 04/13/2026 | 1pm | pending | 0 | 0 | 0 | — | 
2026-04-10 | 16:26 | Jennifer Alobin | Betty Crandall | (323) 867-5309 | 1100 Wilcher Blvd Unit 1700 Los Angeles Ca | ADU | Monday | 7pm | pending | 0 | 0 | 0 | — | HO and DM.
2026-04-10 | 16:57 | Jarelene | Linda Woodburn | (818) 414-6574 | 648 Cambridge Dr |  | Sunday | 1pm | pending | 0 | 0 | 0 | — | Interested in ADU.
2026-04-10 | 17:02 | Aiza | VICTORIA MEZA | (562) 547-9353 | 11551 Maza St Norwalk, CA 90650 |  | 04/12/2026 |  | confirmed | 0 | 0 | 0 | — | 
2026-04-10 | 17:28 | Benica | HECTOR ROBLES | (562) 335-0013 | 6828 Boer Ave, Whittier, CA 90606 |  | 04/12/2026 | 1pm | pending | 0 | 0 | 0 | — | Interested in ADU; cost details TBD by licensed agent.
2026-04-10 | 17:44 | Jennifer Alobin | Linda Walls | (310) 213-9311 | 13925 South Nestor Ave Compton Ca 90222 | JADU | Sunday | 3pm | pending | 0 | 0 | 0 | — | HO and DM.
2026-04-10 | 18:02 | Irene | Orlando Sanders | (582) 716-8745 | 7308 Louise Ave. Van Nuys CA, 91406 |  | April 12, 2026 | 1-2PM | pending | 0 | 0 | 0 | — | Interested in garage conversion.
2026-04-13 | 09:28 | Aiza | GERARDO GARCIA | (424) 703-1553 | 747 W 1st St, San Pedro, CA 90731 |  | 04/13/2026 | 4:00 | transfer | 0 | 0 | 0 | — | 
2026-04-13 | 10:47 | China (Stephany) | JOHN CHAVEZ GABRIELA CHAVEZ | (213) 500-0006 | 2330 Coral St., Los Angeles, CA 90031 |  | 04/13/2026 |  | ia | 15 | 0 | 0 | — | 
2026-04-13 | 10:59 | Gerene | JAVIER CADENAS | (562) 668-2207 | 4057 Olive St, Bell Gardens, CA 90201 |  | 4/13/2026 | 5PM | pending | 0 | 0 | 0 | — | Interested in ADU; callback tomorrow.
2026-04-13 | 11:56 | Jennifer Alobin | Benjamin Macalalad | (714) 337-5766 | 36648 Dafodil Ct Lake Elsinor Ca 92532 | ADU | Today | 4pm | transfer | 0 | 0 | 0 | — | 
2026-04-13 | 12:01 | Arlene | Victor Funez | (323) 360-6178 | 3917 S Budlong Ave #C LA CA 90037 |  | Tomorrow | 12pm | confirmed | 0 | 0 | 0 | — | 
2026-04-13 | 14:51 | China (Stephany) | JESUS CARREON | (626) 926-6682 | 741 N Astell Ave, West Covina, CA 91790 |  | 04/13/2026 |  | transfer | 0 | 0 | 0 | — | 
2026-04-13 | 15:23 | Jennifer Alobin | Myra Serrano | (626) 437-4023 | 281 N Craig Ave Pasadena Ca 91107 | Garage conversion | Tomorrow | 4pm | confirmed | 0 | 0 | 0 | — | Interested; appt may change. Transferred.
2026-04-13 | 15:29 | Ryan | Rozina Ahmad | (562) 991-3042 | 8547 Rives Ave Downey, CA 90240 | ADU | Tomorrow | 9am PCT | dnc | 0 | 0 | 0 | — | 
2026-04-13 | 17:07 | Rhen | BETTY PIVOVAROFF | (661) 946-6562 | 1703 Polo Ct, Lancaster, CA 93535 |  | April 14 | 12pm-1:30pm | pending | 0 | 0 | 0 | — | Interested in ADU; transferring.
2026-04-13 | 17:41 | Jennifer Alobin | Jose Avila | (818) 422-2301 | 7717 Cleon Ave Sun Valley Ca 91352 | Garage conversion | Sunday 4/19 | 3pm | pending | 0 | 0 | 0 | — | DM; wants more info. Available Sunday for transfer.
2026-04-14 | 11:39 | Rhen | Troy Gnerre | (562) 201-2191 | 15927 Jalon Rd. La Mirada CA 90638 |  | April 14 | 3pm | transfer | 0 | 0 | 0 | — | Interested in ADU.
2026-04-14 | 14:20 | Benica | MARSIRLENE CARPENTER | (760) 662-3376 | 18042 Hinton St, Hesperia, CA 92345 |  | 04/14/2026 |  | transfer | 0 | 0 | 0 | — | 
2026-04-14 | 15:42 | Arlene | ROBERT OZAETA | (909) 219-1667 | 2563 Whispering Pines Dr Running Springs CA 92382 |  | Monday | 4pm | transfer | 0 | 0 | 0 | — | Transferring.
2026-04-14 | 15:43 | Jarelene | Rick Ochoa | (951) 454-1939 | 317 S Joy St Corona, CA 92879 |  | Tomorrow | 6PM | transfer | 0 | 0 | 0 | — | Interested; transferring.
2026-04-14 | 16:00 | Jhen | ROSA ALAMILLA | (909) 636-3736 | 13033 Basswood Ave Chino CA 91710 |  | Today | 6PM | transfer | 0 | 0 | 0 | — | 
2026-04-14 | 16:57 | Jennifer Alobin | Pejman Partiyeli | (310) 666-0712 | 2207 Parnell Ave Los Angeles Ca 90064 | ADU | Tomorrow | 11am | confirmed | 0 | 0 | 0 | — | Transferred.
2026-04-14 | 17:24 | Rein | APOLONIO MARTINEZ | (323) 830-7699 | 526 W 88th Pl, Los Angeles, CA 90044 |  | 04/15/2026 | 5 | pending | 0 | 0 | 0 | — | Callback tomorrow before 5; daughter speaks English for him.
2026-04-14 | 17:35 | Liz | Sabrina Feuttechine | (661) 916-4388 | 1704 Sierra View Ave Pennsylvania |  | Tomorrow | 7 PM | pending | 0 | 0 | 0 | — | Transferring.
2026-04-14 | 18:17 | Kemberly | Hee Ja Lee | (714) 609-2472 | 1122 Glenhaven Ave Fullerton, CA 92835 |  | Tomorrow | 1PM | pending | 0 | 0 | 0 | — | Interested in program.
2026-04-15 | 09:19 | China (Stephany) | JOHN NAZARIAN | (310) 560-6053 | 2151 Ravensfield Ln, Los Angeles, CA 90077 |  | 04/15/2026 |  | transfer | 0 | 0 | 0 | — | 
2026-04-15 | 10:18 | Nikita | PAUL ALLEN | (562) 294-9594 | 10546 E Summer Breeze Dr, Moreno Valley, CA 92557 | ADU | 4/24 | 11AM | dnc | 0 | 0 | 0 | — | Transferring.
2026-04-15 | 10:55 | Jennifer Alobin | Omobola Adeleke | (626) 639-9186 | 20 E Market St, Long Beach, CA 90805 | ADU | Today 4/15 | 4pm | pending | 0 | 0 | 0 | — | Not able to transfer; with patient now.
2026-04-15 | 11:18 | Sharon | BERNARDO AGUINAR | (714) 357-3162 | 8592 Lullaby Ln, Stanton, CA 90680 |  | 04/16/2026 | 11am | transfer | 0 | 0 | 0 | — | Will call tomorrow first to confirm exact time.
2026-04-15 | 12:04 | Rein | CHRISTOS PABLICO | (310) 429-9548 | 5103 W 130th St, Hawthorne, CA 90250 |  | 04/17/2026 | After 2pm | pending | 0 | 0 | 0 | — | Requesting CB Friday since off; agreed to learn more about program.
2026-04-15 | 12:45 | Jomar | Clifton Hughley | (562) 500-4420 | 4448 Elm Ave Long Beach CA 90807 |  | Today | 1pm | transfer | 0 | 0 | 0 | — | Already aware to connect with project coordinator. Single family home. Transferred.
2026-04-15 | 15:06 | Rein | DORA PORTILLO | (323) 362-8293 | 1584 W 24th St, Los Angeles, CA 90007 |  | 04/15/2026 | 4:30 | ia | 15 | 10 | 0 | — | Considering garage conversion or whatever fits property.
2026-04-15 | 15:48 | Jhen | luis guzman | (213) 369-4176 |  | adu |  | 6pm | dnc | 0 | 0 | 0 | — | 
2026-04-15 | 16:33 | China (Stephany) | JUAN JIMENEZ | (323) 842-4548 | 1131 Brookdale Ave, La Habra, CA 90631 |  | 04/15/2026 |  | dnc | 0 | 0 | 0 | — | 
2026-04-16 | 09:43 | Jarelene | RICHARD MOUSER | (626) 841-2281 | 181 E Loma Alta Dr, Altadena, CA 91001 |  | Today | 1pm | transfer | 0 | 0 | 0 | — | Interested in ADU; wants to know options first.
2026-04-16 | 09:48 | Benica | RAFAELA TREJO | (760) 235-5759 | 427 S Lorena St, Los Angeles, CA 90063 |  | 04/16/2026 | 1pm | transfer | 0 | 0 | 0 | — | 
2026-04-16 | 10:20 | Benica | AMY GERTZ | (310) 497-6043 | 2520 Devonshire Ln, Altadena, CA 91001 |  | 04/16/2026 | 1pm | transfer | 0 | 0 | 0 | — | 
2026-04-16 | 11:30 | Aiza | MOHAMED IBRAHIM | (626) 354-8385 | 1021 N Avenue 64, Los Angeles, CA 90042 |  | 04/16/2026 | 1:00 | transfer | 0 | 0 | 0 | — | 
2026-04-16 | 11:34 | Benica | KENNETH DAY | (714) 206-1074 | 8971 Blackheath Cir, Westminster, CA 92683 |  | 04/16/2026 | 2pm | transfer | 0 | 0 | 0 | — | Daughter Kristine Takamori interested; 714-425-9413.
2026-04-16 | 11:56 | China (Stephany) | LINDA ORTEGA | (310) 324-9750 | 16104 S Denker Ave, Gardena, CA 90247 |  | 04/16/2026 |  | transfer | 0 | 0 | 0 | — | 
2026-04-16 | 12:50 | China (Stephany) | YOAV SARRAF | (310) 749-9628 | 1253 Westholme Ave, Los Angeles, CA 90024 |  | 04/16/2026 |  | transfer | 0 | 0 | 0 | — | 
2026-04-16 | 15:56 | Benica | RUSSELL JOHNSON | (818) 800-6773 | 15935 Bermuda St, Granada Hills, CA 91344 |  | 04/16/2026 | 5pm | transfer | 0 | 0 | 0 | — | 
2026-04-16 | 16:02 | Lily/Shery | NATHANIEL PINTO | (362) 684-0439 | 216 W Gladstone St, San Dimas, CA 91773 |  | 04/17/2026 | 2pm | transfer | 0 | 0 | 0 | — | Busy now; callback tomorrow afternoon 2pm.
2026-04-16 | 16:07 | Kemberly | EDUARDO ROJOS | (213) 842-6045 | 869 Avenue A, Redondo Beach, CA 90277 |  | 04/16/2026 | 6pm | transfer | 0 | 0 | 0 | — | 
2026-04-16 | 16:34 | Aiza | Mike Mitchell | (909) 738-0007 | 6715 Dana Ave Mira Loma CA 91752 |  | 04/18/2026 | Anytime after 2:00 pm | transfer | 0 | 0 | 0 | — | 
2026-04-16 | 18:01 | Gerene | HAZEL BELL | (323) 734-1669 | 1333 W 37th St Los Angeles CA 90007 |  | 4/17/2026 | 2PM | pending | 0 | 0 | 0 | — | HO single family; needs to talk to son first. Hang-up; will call back tomorrow.
2026-04-17 | 09:28 | Irene | Hhelga Wagner | (310) 540-1595 | 21701 Vicky Avenue Torrance 90503 |  | April 19 | 1PM | transfer | 0 | 0 | 0 | — | 
2026-04-17 | 12:47 | Arlene | Arnetta JOHNSON | (310) 756-9568 | 19437 Radlett Ave Carson, CA 90746 |  | Sunday | 2PM | transfer | 0 | 0 | 0 | — | Mother is HO; she is the DM. Transferring.
2026-04-17 | 13:51 | Arlene | Alfredo Gonzalez | (310) 720-5993 | 122 W Reeve St Compton CA 90220 |  | Sunday | 5PM | transfer | 0 | 0 | 0 | — | Transferring.
2026-04-17 | 15:09 | Gerene | BRIAN HALVERSON | (951) 361-2244 | 15724 Lucky Horse Lane Parker CA 98855 |  | Sunday | Anytime | pending | 0 | 0 | 0 | — | Interested with ADU; HO. Agreed visit Sunday.
2026-04-17 | 15:49 | Jhen | VICTOR LOZADA | (562) 305-7166 | 3595 Santa Fe Ave, Long Beach, CA 90810 |  | 04/19/2026 | 3pm | pending | 0 | 0 | 0 | — | Manufactured home. Wants to know more; call 2hrs before appt.
2026-04-17 | 16:45 | Gerene | JERMAINE COOPER | (562) 313-0766 | 2502 Dashwood St Lakewood CA 90712 |  | Sunday | 5PM | pending | 0 | 0 | 0 | — | Son of HO; interested. Wants to get dad's consent. CB Sunday with dad present.
2026-04-17 | 17:23 | Lily/Shery | WILFREDO DAGAN | (323) 717-0730 | 1436 W 37th St, Los Angeles, CA 90018 |  | 04/19/2026 | 2PM | pending | 0 | 0 | 0 | — | At work; available Sunday 2pm.
2026-04-17 | 17:39 | China (Stephany) | ENRIQUE ESPEJEL | (909) 786-9406 | 7791 Sheridan Way, Fontana, CA 92336 |  | Sunday at 3 PM |  | pending | 0 | 0 | 0 | — | 
2026-04-17 | 17:53 | Arlene | BARBARA WRIGHT | (323) 298-0838 | 5147 Village Grn Los Angeles |  | Monday | 3pm | pending | 0 | 0 | 0 | — | HO/DM. CB - confirm she's homeowner.
2026-04-17 | 18:32 | Gerene | JERALD CHAMALES | (310) 440-3407 | 359 N Bristol Ave Los Angeles CA 90049 |  | Sunday | 11AM | pending | 0 | 0 | 0 | — | HO; agreed for licensed agent visit Sunday.
2026-04-20 | 10:23 | Nikita | ROBIN WIELAND | (818) 648-5854 | 13407 Collins St, Van Nuys, CA 91401 |  | 04/20/2026 | 1pm | transfer | 0 | 0 | 0 | — | 
2026-04-20 | 11:18 | Rhen | ANGIE BASILA | (805) 499-6569 | 1644 Glider Ct, Newbury Park, CA 91320 |  | April 21 | 12pm | transfer | 0 | 0 | 0 | — | Wants to know about ADU.
2026-04-20 | 11:33 | Arlene | Enrique Martinez | (909) 996-3369 | 17187 Pine Ave Fontana CA 92335 |  |  |  | transfer | 0 | 0 | 0 | — | 
2026-04-20 | 12:15 | Arlene | ZAID ABDULHAMEEN | (909) 567-4195 | 9154 Trey Ave Riverside, CA 92503 |  | Today | 4 or 5 PM | transfer | 0 | 0 | 0 | — | Transferring.
2026-04-20 | 15:35 | Gerene | RODOLFO ALVARADO | (702) 351-3871 | 770 Melham Ave La Puente CA 91744 |  | 4/21/2026 | 7PM | transfer | 0 | 0 | 0 | — | Wants info about ADU.
2026-04-20 | 16:48 | Arlene | LAURA ARMSTRONG | (323) 271-6302 | 231 E 102nd St Los Angeles CA 90003 |  | Tomorrow | 6PM | transfer | 0 | 0 | 0 | — | Transferring.
2026-04-20 | 17:55 | China (Stephany) | ALEXANDER BERBER | (714) 791-9368 | 1521 E Fairhaven Ave, Orange, CA 92866 |  | 04/21/2026 |  | pending | 0 | 0 | 0 | — | 
2026-04-21 | 10:32 | Gerene | RONDA BRUTON | (310) 953-8443 | 12411 S San Pedro St Los Angeles CA 90061 |  | 4/21/2026 | 5:30 PM | transfer | 0 | 0 | 0 | — | Wants to know better about ADU; wants to be transferred.
2026-04-21 | 11:54 | Ivy | ROBERT TEMPLETON | (310) 877-8700 | 3233 Federal Ave 90066 |  | 4/22/26 | 3PM | transfer | 0 | 0 | 0 | — | No idea about ADU but wants it in the future.
2026-04-21 | 16:34 | Ryan | DOUGLAS MCKINLEY | (562) 394-6118 | 4514 Hazelbrook Ave, Long Beach CA 90808 |  | 04/21/2026 | 5pm | transfer | 0 | 0 | 0 | — | 
2026-04-21 | 16:48 | Rhen | Tracy Kwok/ XUE GUO | (626) 235-7206 | 2407 Kelburn Ave |  | April 21 | 7pm | transfer | 0 | 0 | 0 | — | Interested in ADU.
2026-04-21 | 17:01 | Arlene | DAO NGUYEN | (714) 683-3867 | 1769 Westp Ave, Anaheim, CA 92804 |  | 04/21/2026 |  | pending | 0 | 0 | 0 | — | Single family 2bd/1ba. Wants visit with licensed agent.
2026-04-22 | 09:19 | Aiza | VINCENTE MEDINA | (626) 632-0076 | 14443 7th St, Whittier, CA 90602 |  | 04/22/2026 | 5:00 | transfer | 0 | 0 | 0 | — | 
2026-04-22 | 09:47 | Aiza | ABDUL AHMADI | (714) 783-6671 | 2107 Carol Dr, Fullerton, CA 92833 |  | 04/22/2026 | After 5:00 pm | ia | 15 | 15 | 0 | — | Garage conversion.
2026-04-22 | 10:58 | Jennifer Alobin | RENAY Sehgal | (909) 319-6163 | 5646 W Phillips Blvd Ontario CA 91762 | Additional Backyard unit | Monday 4/27 | 11am | transfer | 0 | 0 | 0 | — | 
2026-04-22 | 11:00 | Irene | Natasha Myers | (714) 624-8135 | 5741 Citrus Ranch Cir Yorba Linda CA 92887 |  | April 23, 2026 | 5pm | transfer | 0 | 0 | 0 | — | 
2026-04-22 | 11:18 | Irene | Jaime Rosales | (626) 200-8798 | 3283 Del Vina St Pasadena CA, 91107 |  | April 23, 2026 | 4pm | transfer | 0 | 0 | 0 | — | Wants to talk to expert; currently at work.
2026-04-22 | 15:28 | Rein | Sam / STACY LUMBREZER | (203) 721-1538 | 2523 7th Ave, Los Angeles, CA 90018 |  | 04/23/2026 | 11 | transfer | 0 | 0 | 0 | — | Waited for visit last week; no one came.
2026-04-22 | 16:53 | China (Stephany) | JOEL STEINGOLD | (310) 424-8342 | 7040 2nd Ave, Los Angeles, CA 90043 |  | 04/23/2026 |  | confirmed | 0 | 20 | 0 | — | 
2026-04-23 | 09:23 | Rein | NADER TASHAKOR | (818) 216-8833 | 7530 Sausalito Ave, West Hills, CA 91307 |  | 04/23/2026 | 2pm | ia | 15 | 15 | 0 | — | Asking about interest on payment.
2026-04-23 | 09:26 | Irene | PHICHAN YAUNGSRI | (714) 478-5172 | 12581 Vista Panorama Santa Ana CA 92705 |  | April 23, 2026 | 1-2PM | transfer | 0 | 0 | 0 | — | Interested in ADU.
2026-04-23 | 10:14 | Mac | erica luna |  | 12514 Magnolia Ave |  |  |  | transfer | 0 | 0 | 0 | — | Wanted to speak with the closer; Angel took over.
2026-04-23 | 11:00 | Jhen | AHMED SABER | (573) 647-1471 | 36 Tavella Pl, Foothill Ranch, CA 92610 |  | 04/24/2026 | 6:30pm | transfer | 0 | 0 | 0 | — | ADU.
2026-04-23 | 11:29 | Jennifer Alobin | Pedro Ochoa | (714) 526-3646 | 316 N Ranchito St Anaheim CA 92801 | ADU | Tomorrow | 5pm | confirmed | 0 | 15 | 0 | — | 
2026-04-23 | 11:39 | Jennifer Alobin | Pacita Weil | (323) 493-8377 | 13115 Keswick St North Hollywood CA | ADU | Sunday | 11 AM | transfer | 0 | 0 | 0 | — | 
2026-04-23 | 16:36 | Rein | TONY DIAS | (909) 910-8547 | 6119 Walnut Ave Chino CA 91710 |  | 04/23/2026 | 7pm | confirmed | 0 | 15 | 0 | — | 
2026-04-23 | 16:44 | Lily/Shery | JOSIE WALSH | (248) 910-1717 | 6717 Chimineas Ave, Reseda, CA 91335 |  | 04/23/2026 |  | transfer | 0 | 0 | 0 | — | Interested in ADU.
2026-04-23 | 17:34 | Jennifer Alobin | Lilya MERDZHIMEKIAN | (818) 422-6008 | 7950 Mammoth Ave Panorama City CA 91402 | ADU | Sunday 4/26 | 3pm | pending | 0 | 0 | 0 | — | 
2026-04-23 | 17:47 | Jennifer Alobin | Arne Bass | (909) 541-8646 | 1318 Ballerina Pl Pomona Ca 91768 | Additional unit | Tuesday 4/28 | 1:30 | pending | 0 | 0 | 0 | — | Call Monday afternoon to xfer; Tuesday is his off.
2026-04-24 | 10:33 | Rein | Mamata KHANDAI | (949) 609-9635 | 20 San Angelo, Foothill Ranch, CA 92610 |  | 04/24/2026 | 1pm | ia | 15 | 5 | 0 | — | Asking for estimate; wants separate unit outside the house.
2026-04-24 | 11:37 | Rhen | ISAAC MEDINA | (626) 277-9003 | 1922 Floradale Ave, South El Monte, CA 91733 |  | April 24 | 1pm | transfer | 0 | 0 | 0 | — | Interested in ADU.
2026-04-24 | 12:28 | Jennifer Alobin | MARIO Marin | (714) 785-3637 | 1406 S Flower St Santa Ana CA 92707 | ADU | Sunday | 1PM | transfer | 0 | 0 | 0 | — | Not avail to transfer; at work. Available Sunday.
2026-04-24 | 12:47 | Lily/Shery | EUNHEE KWON | (253) 582-3094 | 2025 Pray St, Fullerton, CA 92833 |  | 04/24/2026 |  | transfer | 0 | 0 | 0 | — | Interested in ADU.
2026-04-24 | 12:51 | Rein | JOSE MEZA | (805) 796-1173 | 434 Dorothy Ave, Moorpark, CA 93021 |  | 04/26/2026 | After 1pm | confirmed | 0 | 15 | 0 | — | Wants a room addition.
2026-04-24 | 13:19 | Arlene | PAUL YUNG | (310) 383-5406 | 3661 McLaughlin Ave, Los Angeles, CA 90066 |  | Sunday | 1PM | dnc | 0 | 0 | 0 | — | 
2026-04-24 | 16:02 | Gerene | CARLOS MENDOZA | (805) 248-2332 | 2723 Tolstoy Pl Oxnard CA 93033 |  | Sunday | 7 PM | pending | 0 | 0 | 0 | — | HO in gated community; agreed for visit Sunday 7pm.
2026-04-27 | 14:39 | Emil | Judy Goodman |  | 161 Breezewood St Corona CA 92879 |  | April 27, 2026 | 3pm | transfer | 0 | 0 | 0 | — | 
2026-04-27 | 17:07 | Jennifer Alobin | Joel Huerta | (310) 339-3498 | 531 Shields Dr San Pedro CA 90731 | Garage Conversion | Wed | 11am | pending | 0 | 0 | 0 | — | CB 9am to transfer.
2026-04-27 | 17:10 | Keith | JOSE SANCHEZ | (562) 458-7762 | 1551 Mikinda Ave, La Habra, CA 90631 |  | Tuesday | 11am | pending | 0 | 0 | 0 | — | CB 11am to discuss ADU.
2026-04-27 | 17:56 | Keith | MARTIN JIMENEZ | (323) 489-9551 | 315 W 121st St, Los Angeles, CA 90061 |  | Tuesday | 11am | dnc | 0 | 0 | 0 | — | CB 11am to discuss ADU.
2026-04-27 | 17:59 | Jarelene | TYRES WALLACE | (909) 550-9501 | 11461 Old Spring Rd, Fontana, CA 92337 |  | Tomorrow | 1pm | pending | 0 | 0 | 0 | — | Needs Spanish assessor tomorrow. Talk slowly.
2026-04-28 | 09:37 | Arlene | JAIME CAMARENA | (805) 901-1882 | 3148 S J St, Oxnard, CA 93033 |  | 04/29/2026 | 3pm | confirmed | 0 | 5 | 0 | — | 
2026-04-28 | 10:16 | Ivy | PIRAYEH SOHRABPOUR | (310) 254-5524 | 17707 Martha St 91316 |  | Thursday | 11am | confirmed | 0 | 5 | 0 | — | Wants ADU; cost info.
2026-04-28 | 10:40 | Ivy | CLIFFORD BIGLER | (661) 803-1203 | 28305 Simsalido Ave 91350 |  | June 16 | 11AM | transfer | 0 | 0 | 0 | — | Not sure about address; in Miami. Interested in ADU.
2026-04-28 | 11:03 | Jarelene | DAVID STUARD | (310) 801-5096 | 5244 W 140th St, Hawthorne, CA 90250 |  | Today | 1pm | transfer | 0 | 0 | 0 | — | 
2026-04-28 | 11:29 | Emil | Sean Weber | (310) 990-3160 | 27441 Raindance Pl Santa Clarita CA 91350 |  | April 28, 2026 | 2pm | confirmed | 0 | 5 | 0 | — | 
2026-04-28 | 11:37 | Jarelene | shawn bahr | (949) 690-4898 | 2329 Ocean Ave, La California 90291 |  | Today | 1pm | ia | 15 | 5 | 0 | — | 
2026-04-28 | 11:42 | Arlene | Richard Buck | (951) 805-8813 | 26760 Via Bueltas CA |  | Today | 5PM | transfer | 0 | 0 | 0 | — | Transferring. Address: 26760 Via Bueltas CA.
2026-04-28 | 11:51 | Rein | SCOTT EISNER | (818) 398-0630 | 18706 Hillsboro Rd, Porter Ranch, CA 91326 |  | 04/28/2026 | 3pm | transfer | 0 | 0 | 0 | — | Wants to confirm about HOA.
2026-04-28 | 14:44 | Arlene | BRANDEN RAMOS | (661) 917-8862 | 44501 Encanto Way, Lancaster, CA 93536 |  | 04/29/2026 | 6pm | transfer | 0 | 0 | 0 | — | Secondary units.
2026-04-28 | 15:38 | Mac | RICHARD BUCK | (951) 805-8813 | 26760 Via Bueltas, Temecula, CA 92879 |  | 04/28/2026 |  | transfer | 0 | 0 | 0 | — | 26760 Via Vueltas / Temecula, CA 92590.
2026-04-28 | 15:58 | Mac | DAMON GARR | (310) 722-8520 | 4212 W 61st St, Los Angeles, CA 90043 |  | 05/05/2026 | 3:00pm | transfer | 0 | 0 | 0 | — | Garage detach.
2026-04-28 | 16:36 | Arlene | COREY PATE | (305) 407-0678 | 317 S Beachwood Dr, Burbank, CA 91506 |  | 04/30/2026 | 5pm | confirmed | 0 | 5 | 0 | — | Garage conversion.
2026-04-28 | 17:14 | Irene | JUAN VARGAS | (323) 767-7816 | 11009 Howard St Whittier CA 9060 |  | April 29, 2026 | 5pm | dnc | 0 | 0 | 0 | — | Interested in garage conversion.
2026-04-28 | 17:31 | Irene | Jose ramirez | (909) 371-7106 | 1047 Smoketree Dr Corona CA 92882 |  | April 29 | 1pm | pending | 0 | 0 | 0 | — | Interested in garage conversion; transferring.
2026-04-28 | 17:37 | China (Stephany) | Edward J Sylvester | (805) 801-1178 | 1245 Hillcrest Dr |  | 04/29/2026 |  | pending | 0 | 0 | 0 | — | 
2026-04-28 | 17:49 | Rhen | SAID SAADATI | (805) 477-8104 | 9166 Santa Margarita Rd, Ventura, CA 93004 |  | April 29 | 2pm | pending | 0 | 0 | 0 | — | Interested; CB tomorrow for transfer.
2026-04-29 | 10:03 | Mac | ARTHUR PARRIS | (562) 822-8051 | 1541 Eleanor St, Long Beach, CA 90805 |  | 04/30/2026 | 10:00 AM | confirmed | 0 | 5 | 0 | — | Detach.
2026-04-29 | 11:28 | Monica | PIRAYEH SOHRABPOUR | (310) 254-5524 | 17707 Martha St, Encino, CA 91316 |  | 05/07/2026 | 11am | transfer | 0 | 0 | 0 | — | User wants to reschedule the assessment.
2026-04-29 | 15:27 | Rhen | VICTOR DIAZ | (951) 415-5868 | 2168 Powers St, Pomona, CA 91766 |  | April 29 | 7pm | transfer | 0 | 0 | 0 | — | Interested; wants to know more about ADU. Speak slowly.
2026-04-29 | 17:05 | Jennifer Alobin | DEEPAK RAJAGOPAL | (310) 948-7171 | 1960 Winding Ln S Pasadena Ca 91030 |  | Monday | 11 AM | pending | 0 | 0 | 0 | — | Request CB Friday to xfer.
2026-04-29 | 17:35 | China (Stephany) | NORAYR KESHISHYAN | (714) 701-9191 | 2417 E Glenoaks Blvd, Glendale, CA 91206 |  | 04/29/2026 |  | pending | 0 | 0 | 0 | — | 
2026-04-29 | 18:18 | Mac | GABRIEL GARCIA | (951) 533-1031 | 4422 Elizabeth St, Cudahy, CA 90201 |  | 04/30/2026 | 6:00PM | pending | 0 | 0 | 0 | — | 
2026-04-30 | 10:00 | Aiza | Alejandro M |  |  |  |  |  | ia | 15 | 10 | 0 | — | Manually added — confirmed in chat
2026-04-30 | 12:10 | Aiza | ALEJANDO M | (323) 448-5053 | 656 S Idiana St, Los Angeles, CA 90023 |  | 04/30/2026 | 6:00 | transfer | 0 | 0 | 0 | — | 
2026-04-30 | 12:13 | Arlene | BENJAMIN MACALALAD | (714) 337-5766 | 124 West Zane Street, Long Beach, CA 90805 |  | 04/30 | 2pm | transfer | 0 | 0 | 0 | — | HO/DM; address within 75 miles of Encino.
2026-04-30 | 12:31 | Mac | HILDA MAGALLANDS | (909) 917-9953 | 10980 White Oak Ln, Fontana, CA 92337 |  | 04/30/2026 |  | transfer | 0 | 0 | 0 | — | Wants prices first before appt.
2026-04-30 | 12:42 | Ivy | CHAYA KAVKA | (347) 342-2153 | 119 S Orange Dr 90036 |  | 4/30/26 | 3pm | transfer | 0 | 0 | 0 | — | Interested in ADU.
2026-04-30 | 14:58 | Rein | LEONEL ARDON | (323) 271-6364 | 7853 Melva St, Downey, CA 90242 |  | 05/05/2026 |  | transfer | 0 | 0 | 0 | — | Wants visit next Tuesday; will CB again.
2026-04-30 | 15:53 | Jarelene | RUCHI NARKAR | (929) 386-7213 | 1822 Verde Vista Dr, Monterey Park, CA 91754 |  | Tomorrow | 11am | transfer | 0 | 0 | 0 | — | Interested in ADU; spoke to other company. Wants name of our company.
2026-04-30 | 16:21 | China (Stephany) | Marley Breaux | (909) 380-2108 | 10425 El Rancho Dr, Whittier, CA 90606 |  | 04/30/2026 |  | transfer | 0 | 0 | 0 | — | 
2026-04-30 | 17:19 | Rhen | EULALIO MACIAS | (310) 491-4690 | 10025 Burin Ave, Inglewood, CA 90304 |  | April 30 | 11am | pending | 0 | 0 | 0 | — | Wants more info about ADU; CB tomorrow for transfer.
2026-04-30 | 17:24 | Irene | THOMAS ANNARELLA | (714) 319-7879 | 7 Sebastian, Irvine, CA 92602 |  |  |  | pending | 0 | 0 | 0 | — | Wants more info about ADU; CB tomorrow for transfer.
2026-05-01 | 10:25 | Nikita | MARAL BILEMJIAN | (818) 207-7771 | 722 East Orange Grove Avenue Unit Townhouse, Burbank, CA 91501 |  | 05/01/2026 |  | dnc | 0 | 0 | 0 | — | Inbound. Wanted ADU 3pm-4pm.
2026-05-01 | 10:29 | Ivy | TONY QUACH | (626) 802-8312 | 1228 S 3rd Ave 91006 |  | Today | 11AM | transfer | 0 | 0 | 0 | — | Interested ADU.
2026-05-01 | 10:50 | China (Stephany) | REBECCA NUNEZ SANTILLAN | (626) 257-4932 | 4037 Vineland Ave, Baldwin Park, CA 91706 |  | 05/01/2026 |  | transfer | 0 | 0 | 0 | — | 
2026-05-01 | 12:34 | Arlene | ARUN PARIKH | (714) 991-4891 | 2749 N Surrey St, Orange, CA 92867 |  | 05/03/2026 | 2pm | confirmed | 0 | 10 | 0 | — | 7116 Larino St Anaheim 92801 — add room and patio. 2749 N Surrey — additional bathroom/room/2nd floor.
2026-05-01 | 16:32 | Mac | ARUNRAJ RAMALINGAM | (626) 636-1723 | 6141 Ivar Ave, Temple City, CA 91780 |  | 05/03/2026 | 11:00 | confirmed | 0 | 5 | 5 | China (Stephany) | Detach.
2026-05-04 | 09:05 | China (Stephany) | REGINALD TAN | (661) 547-4466 | 25661 Magnolia Ln, Stevenson Ranch, CA 91381 |  | 05/04/2026 |  | confirmed | 0 | 5 | 0 | — | Cost; ADU in back yard.
2026-05-04 | 09:15 | Mac | FARIBORZ ROSTAMIAN | (916) 221-1920 | 13342 Diamond Head Dr, Tustin, CA 92780 |  | 05/04/2026 | 7:00pm | ia | 15 | 5 | 5 | China (Stephany) | 
2026-05-04 | 09:42 | Mac | THANIA ROSSMAN | (562) 533-8102 | 1214 W 130th St, Compton, CA 90222 |  | 05/04/2026 | 6:00pm | ia | 25 | 5 | 5 | China (Stephany) | 
2026-05-04 | 11:03 | Arlene | ALFREDO SANTOS | (626) 372-5468 | 7233 Jamieson Ave, Reseda, CA 91335 |  | 05/05/2026 | 12:00pm | transfer | 0 | 0 | 0 | — | Interested in backyard cottages; spoke with Erin and Brian Knor HO/DM.
2026-05-04 | 11:21 | Nikita | HANNAH RAZZOUQ | (714) 204-1961 | 523 N Colgate St, Anaheim, CA 92801 |  | 05/04/2026 | 6pm | ia | 15 | 0 | 0 | — | Callback Monday; wanted ADU near balcony.
2026-05-04 | 11:49 | Mac | STEVE SCHMISSRAUTER | (818) 671-3958 | 20849 Exhibit Place, Woodland Hills, CA 91367 |  | 05/04/2026 | 3:00pm | ia | 35 | 0 | 5 | China (Stephany) | 
2026-05-04 | 12:12 | Arlene | POV SENG | (562) 928-2191 | 7938 Farm St, Downey, CA 90241 |  | 05/04/2026 | 3PM | ia | 15 | 5 | 0 | — | Garage conversion.
2026-05-04 | 12:46 | China (Stephany) | GEORGE PICHARDO | (657) 358-9702 | 717 Grovemont St, Santa Ana, CA 92706 |  | 05/04/2026 |  | transfer | 0 | 0 | 0 | — | 
2026-05-04 | 14:14 | Rhen | JACOB JOSEPH | (626) 394-9533 | 1103 W Whittlers Ln, Ontario, CA 91762 |  | May 4 | 5pm | transfer | 0 | 0 | 0 | — | Interested; wants more info.
2026-05-04 | 15:02 | Irene | Shaira Gomez | (310) 697-6124 | 528 Paseo De La Playa, Redondo Beach, CA 90277 |  |  |  | transfer | 0 | 0 | 0 | — | 
2026-05-05 | 09:14 | Rhen | Russell Szynokowski | (760) 792-4747 | 46750 Riverside Rd Newberry Spring CA 92365 |  | May 5 | 3:30 pm | transfer | 0 | 0 | 0 | — | Interested in ADU.
2026-05-05 | 09:30 | Rein | Mr. VERONICA GARCIA | (909) 380-2108 | 10425 El Rancho Dr Whittier CA 90606 |  | 05/05/2026 | 3 | transfer | 0 | 0 | 0 | — | 
2026-05-05 | 09:54 | Mac | ALEJANDRA VACA | (805) 603-9588 | 6427 Vassar Cir, Moorpark, CA 93021 |  | 05/05/2026 | 3:00am | ia | 15 | 5 | 5 | China (Stephany) | 
2026-05-05 | 11:03 | Aiza | FLORIDALMA TOVAR | (323) 819-9466 | 208 W 80th St, Los Angeles, CA 90003 |  | 05/06/2026 | After 4:00 PM | transfer | 0 | 0 | 0 | — | Interested in garage.
2026-05-05 | 11:42 | Mac | ALFRED TURMAN | (661) 803-7583 | 15514 Megan Dr, Canyon Country, CA 91387 |  | 05/05/2026 | 6:00PM | transfer | 0 | 0 | 0 | — | 
2026-05-05 | 11:54 | China (Stephany) | ben | (626) 822-7220 | 2209 Balwin Ave, Arcadia, CA 91007 |  | 05/05/2026 |  | transfer | 0 | 0 | 0 | — | 
2026-05-05 | 12:36 | Jennifer Alobin | Parul Desai | (909) 248-0161 | 16081 Rincon Meadows Ave Chino CA 91708 |  | 5/5 | 3pm | ia | 15 | 0 | 0 | — | 
2026-05-05 | 12:49 | Rhen | WILLIAM MIRAHEM | (818) 586-0663 | 22524 Paraguay Dr, Santa Clarita, CA 91350 |  | May 5 | 3pm | transfer | 0 | 0 | 0 | — | Interested in ADU.
2026-05-05 | 17:14 | Rhen | ROBERT KENNETH DEMONTE | (805) 529-1304 | 3860 Hunters Grove Ct, Moorpark, CA 93021 |  | May 6 | 2pm | pending | 0 | 0 | 0 | — | Interested in ADU; CB tomorrow for transfer.
2026-05-05 | 17:18 | Rein | ROBERTO TELLEZ | (661) 268-9299 | 37050 95th St E, Littlerock, CA 93543 |  | 05/06/2026 | 2-3 pm | pending | 0 | 0 | 0 | — | Separate unit but doesn't want anything on back.
2026-05-05 | 17:55 | Mac | BIZEN YOHANNES | (323) 224-3991 | 1434 Montecito Dr, Los Angeles, CA 90031 |  | 05/06/2026 | 5:00PM | pending | 0 | 0 | 0 | — | 
2026-05-06 | 10:13 | Aiza | NANCY TUCKER | (661) 264-4610 | 16255 Stagecoach Ave, Palmdale, CA 93591 |  | 05/08/2026 | 11:00 | transfer | 0 | 0 | 0 | — | 
2026-05-06 | 10:20 | Arlene | PETER ALBRECHT | (714) 432-8750 | 2339 Notre Dame Rd, Costa Mesa, CA 92626 |  | 05/06/2026 | 3PM | ia | 15 | 5 | 0 | — | Garage conversion.
2026-05-06 | 12:41 | Ivy | JOSE CRUZ | (661) 433-2462 | 37902 San Carlos Way, Palmdale, CA 93550 |  | 05/06/2026 | 6:30 | transfer | 0 | 0 | 0 | — | Interested in ADU.
2026-05-06 | 14:50 | Gerene | BUDD (nickname) | (714) 719-0202 | 961 Union Ave Costa Mesa CA 92627 |  | 05/06/2026 | Afternoon | transfer | 0 | 0 | 0 | — | Interested in ADU; CB tomorrow to transfer.
2026-05-06 | 15:51 | Arlene | TRINA/ANTHONY ARREDONDO | (626) 598-2462 | 422 S Alta Vista Ave, Monrovia, CA 91016 |  | 05/07/2026 | 11AM | dnc | 0 | 0 | 0 | — | Garage conversion.
2026-05-06 | 17:00 | Rein | DEBORAH CHILDRESS | (562) 818-2026 | 8702 Meadow Rd, Downey, CA 90242 |  | 05/06/2026 |  | pending | 0 | 0 | 0 | — | Need to CB when home.
2026-05-06 | 17:32 | Arlene | SANDRA CALDERON | (562) 417-1962 | 3576 Marshall St, Riverside, CA 92504 |  | 05/07/2026 | 6PM | pending | 0 | 0 | 0 | — | Wants to know more about interest/cost.
2026-05-07 | 10:01 | Rhen | Moses Mendoza | (661) 733-5449 | 2734 Fairfield Ave Palmdale, CA 93550 |  | May 22 |  | pending | 0 | 0 | 0 | — | Interested; can't appt today (on vacation). CB when home.
2026-05-07 | 11:13 | Rein | MARIA PEREZ | (323) 440-5414 | 6412 Crescent St. Los Angeles CA 90042 |  | 05/08/2026 | 3pm | transfer | 0 | 0 | 0 | — | Wants garage conversion; has questions.
2026-05-07 | 12:49 | Aiza | MATTHEW PASTER | (323) 810-0314 | 3948 S Norton Ave, Los Angeles, CA 90008 |  | 05/11/2026 | After 11:00 | confirmed | 0 | 0 | 0 | — | Garage conversion.
2026-05-07 | 13:03 | Aiza | FEROZE THALIFFDEEN | (714) 371-6926 | 12971 Brittany Woods Dr, Santa Ana, CA 92705 |  | 05/08/2026 | After 6:00 | confirmed | 0 | 15 | 0 | — | 
2026-05-07 | 14:33 | Ivy | TRACY REYES | (323) 898-4293 | 3633 Marmion Way, Los Angeles, CA 90065 |  | 05/07/2026 | 6:00 | transfer | 0 | 0 | 0 | — | 
2026-05-07 | 15:25 | Rein | ADA GOMEZ | (213) 296-8952 | 142 S Normandie Ave Los Angeles, CA 90004 |  | 05/08/2026 | 6-7 pm | transfer | 0 | 0 | 0 | — | 
2026-05-07 | 15:27 | Emil | Jack Garcia | (909) 380-2108 | 10425 El Rancho Dr Whittier CA 90606 |  | May 7 2026 | 7PM | transfer | 0 | 0 | 0 | — | 
2026-05-07 | 15:34 | China (Stephany) | ERIC GONZALEZ | (909) 440-0223 | 1372 N Isadora Way, Ontario, CA 91764 |  | 05/07/2026 |  | transfer | 0 | 0 | 0 | — | 
2026-05-07 | 16:48 | Irene | Augie Martinez | (805) 276-5419 | 280 S Brent St. Ventura CA 93003 |  |  |  | transfer | 0 | 0 | 0 | — | Interested for the quotation.
2026-05-07 | 17:18 | Rein | EILEEN/ MR JONES-DEVIN | (310) 906-8016 | 1434 East 122nd St. Los Angeles CA 90059 |  | 05/10/2026 | 11 am | pending | 0 | 0 | 0 | — | 
2026-05-07 | 18:29 | China (Stephany) | DAVID LUNA// ERIC | (661) 944-7796 | 13375 Berg St, Sylmar, CA 91342 |  | 05/08/2026 |  | pending | 0 | 0 | 0 | — | 
2026-05-07 | 18:52 | Gerene | GEORGE MALKI | (562) 378-7909 | W 14th St LA, CA USA |  | Friday | Anytime | pending | 0 | 0 | 0 | — | Confirmed interest in ADU; visit tomorrow.
2026-05-08 | 10:56 | Rein | ADA PORTILLO | (323) 972-9590 | 4210 E San Luis St, Compton, CA 90221 |  | 05/10/2026 | 5 pm | confirmed | 0 | 0 | 0 | — | Spanish assessor preferred; son speaks English.
2026-05-08 | 11:29 | Mac | ALBERT REED | (301) 535-2654 | 11217 Compton Ave, Los Angeles, CA 90059 |  | 05/10/2026 | 10:00 | transfer | 0 | 0 | 0 | — | 
2026-05-08 | 11:29 | Rein | ZUBAIR RAO | (310) 986-0824 | 30042 Avenida Esplendida, Rancho Palos Verdes, CA 90275 |  | 05/10/2026 | 11 am | confirmed | 0 | 0 | 0 | — | 
2026-05-08 | 13:02 | Mac | DAVID SHEFFIELD | (661) 285-8090 | 5836 Paddington Dr, Palmdale, CA 93552 |  | 05/10/2026 |  | transfer | 0 | 0 | 0 | — | 
2026-05-08 | 15:54 | China (Stephany) | patra baxster | (310) 995-2416 | 14866 Daphne Ave |  | 05/10/2026 |  | pending | 0 | 0 | 0 | — | 
2026-05-08 | 17:08 | Arlene | ELIAS BARRON | (626) 825-8945 | 18438 E Fondale St, Azusa, CA 91702 |  | 05/10/2026 | 3PM | pending | 0 | 0 | 0 | — | Wants more info — details, rebates, how it works.
2026-05-11 | 09:49 | Jennifer Alobin | MR. LOTFIPOUR | (714) 376-7912 | 11925 Lambert Orange CA |  | 05/11/2026 | 1pm | ia | 15 | 0 | 0 | — | 
2026-05-11 | 10:04 | China (Stephany) | Devinn Mcdaniel | (323) 295-9772 | 3709 Degnan Blvd, Los Angeles, CA 90018 |  | 05/11/2026 | 3pm | dnc | 0 | 0 | 0 | — | 
2026-05-11 | 10:05 | Nikita | DAVID BANG | (818) 912-7555 | 23414 Via Farallon, Valencia, CA 91355 |  | 05/13/2026 | 3PM | confirmed | 0 | 0 | 0 | — | 
2026-05-11 | 10:07 | Rein | VICENTE GONZALEZ | (714) 875-6949 | 624 S Illinois St, Anaheim, CA 92805 |  | 05/13/2026 |  | pending | 0 | 0 | 0 | — | Out of state; needs to talk to wife; CB Wednesday.
2026-05-11 | 10:13 | Jarelene | Dolores L Gonzalez | (818) 422-1086 | 10056 Bartee Ave, Pacoima, CA 91331 |  |  |  | pending | 0 | 0 | 0 | — | Not feeling well; CB Wed or Friday.
2026-05-11 | 10:22 | Arlene | RAHEEM HASAN | (213) 447-1848 | 4420 Don Felipe Dr, Los Angeles, CA 90008 |  | 05/11/2026 | 5pm | transfer | 0 | 0 | 0 | — | Wants to hear more about ADU.
2026-05-11 | 10:52 | China (Stephany) | James,Linda | (818) 908-8365 | 14225 Tiara St, Van Nuys, CA 91401 |  | 05/11/2026 |  | transfer | 0 | 0 | 0 | — | 
2026-05-11 | 10:53 | Gerene | DAVID ARIAS | (562) 298-3146 | 14024 Dittmar Dr Whittier CA 90605 |  | Tomorrow | Anytime | transfer | 0 | 0 | 0 | — | Seems interested with ADU; CB tomorrow for clarification.
2026-05-11 | 14:13 | China (Stephany) | JAMES SELTZER | (310) 863-4401 | 1233 E 142nd St, Compton, CA 90222 |  | 05/11/2026 |  | ia | 15 | 0 | 0 | — | 
2026-05-11 | 14:48 | Jarelene | ADDRESS: 25388 IDEAL AVE, LANCASTER, CA 93536 | (714) 317-4832 | 25388 Ideal Ave, Lancaster, CA 93536 |  | Today | 5 pm | transfer | 0 | 0 | 0 | — | CX wants transfer but won't confirm name; dialer shows Erik Berg.
2026-05-11 | 15:05 | Arlene | JUDAH RAMIREZ | (310) 220-9943 | 435 W 9th St, Upland, CA 91786 |  | 05/11/2026 | 6PM | transfer | 0 | 0 | 0 | — | 
2026-05-11 | 16:01 | Rein | EDGARDO SANCHEZ | (323) 216-1279 | 8718 Andes St, San Gabriel, CA 91776 |  | 05/18/2026 |  | transfer | 0 | 0 | 0 | — | 
2026-05-11 | 17:46 | Mac | CHELLE WELSH | (323) 466-7759 | 3121 Ledgewood Dr, Los Angeles, CA 90068 |  | 05/11/2026 | 10:00AM | pending | 0 | 0 | 0 | — | 
2026-05-11 | 18:00 | Arlene | YONGXING WU | (213) 330-5648 | 232 S Orange Blossom Ave, La Puente, CA 91746 |  | 05/12/2026 | 3PM | ia | 15 | 5 | 0 | — | Wants amount info for ADU; requested Chinese property manager; using translator.
2026-05-12 | 10:34 | Arlene | LLOYD NORDLING | (424) 350-7422 | 2221 Belmont Ln Redondo Beach CA 90278 |  | 05/13/2026 | 6:30 PM | confirmed | 0 | 5 | 0 | — | 
2026-05-12 | 10:56 | Gerene | GERARD FIGUEROA | (661) 433-1083 | 9558 Leona Ave Palmdale CA 93551 |  | 5/12/2026 | 7 pm | transfer | 0 | 0 | 0 | — | Interested; wants to know cost. Agreed to visit; couldn't transfer (meeting).
2026-05-12 | 11:28 | Mac | JAVIER MENDEZ | (323) 338-2516 | 134 E 53rd St, Los Angeles, CA 90011 |  | 05/12/2026 | 7:00pm | transfer | 0 | 0 | 0 | — | 
2026-05-12 | 11:28 | Nikita | VICTOR GARCIA | (909) 380-2108 | 10425 El Rancho Dr Whittier CA 90606 |  | 05/12/2026 |  | transfer | 0 | 0 | 0 | — | Today at 4pm; interested ADU.
2026-05-12 | 13:20 | Mac | CARLOS GUTIERREZ | (323) 360-5139 | 2815 Elm St, Los Angeles, CA 90065 |  | 05/12/2026 | 5:00pm | transfer | 0 | 0 | 0 | — | 
2026-05-12 | 15:22 | Rein | PHIL GOFF | (213) 703-7758 | 1808 E 123rd St, Los Angeles, CA 90059 |  |  |  | pending | 0 | 0 | 0 | — | Son is a co-owner; need to talk to son; asking for CB.
2026-05-12 | 15:31 | Jennifer Alobin | Jose Chavez | (714) 501-2288 | 14331 Soleil Dr Corona CA 92880 |  | 05/13/2026 | 4pm | ia | 15 | 5 | 0 | — | 
2026-05-12 | 15:54 | Arlene | APOLONIO MARTINEZ | (323) 915-7559 | 526 W 88th Pl, Los Angeles, CA 90044 |  | 05/13/2026 | 3pm | ia | 15 | 10 | 0 | — | Requesting Spanish consultant tomorrow.
2026-05-12 | 16:42 | Rein | ERIKA MONCIVAIS DELGADO | (310) 422-5187 | 19502 Scobey Ave, Carson, CA 90746 |  | 05/18/2026 | 7 pm | pending | 0 | 0 | 0 | — | Also owner; needs to talk to husband for decision; CB.
2026-05-12 | 17:24 | China (Stephany) | MARTIN PAZ | (626) 388-8709 | 15809 San Jose Ave, La Puente, CA 91744 |  | 05/13/2026 |  | pending | 0 | 0 | 0 | — | 
2026-05-13 | 09:17 | Mac | MOHAMMAD HARANDI | (310) 619-4455 | 3619 Sara Dr, Torrance, CA 90503 |  | 05/13/2026 | 10:00am | transfer | 0 | 0 | 0 | — | 
2026-05-13 | 09:20 | Aiza | JUAN RUAN | (562) 833-3316 | 153 E Norton St, Long Beach, CA 90805 |  | 05/14/2026 | 11:00 | dnc | 0 | 0 | 0 | — | 
2026-05-13 | 10:25 | Arlene | Robert TORRES | (760) 861-9260 | 13435 Gunderson Ave, Downey, CA 90242 |  | 05/13/2026 | 3PM | transfer | 0 | 0 | 0 | — | Wants storage unit in backyard.
2026-05-13 | 11:03 | Mac | TEYANNA WILLIAMS | (213) 500-4780 | 1707 W 39th Pl, Los Angeles, CA 90062 |  | 05/14/2026 | 12:00pm | ia | 15 | 10 | 0 | — | 
2026-05-13 | 11:05 | Aiza | MAXINE WILLIAMS | (424) 221-3812 | 1210 N Pearl Ave, Compton, CA 90221 |  | 05/13/2026 | 2:00 | ia | 15 | 10 | 0 | — | Detached ADU.
2026-05-13 | 11:25 | Rein | PHIL YI | (213) 700-7445 | 16366 Santa Bianca Dr, Hacienda Heights, CA 91745 |  | 05/13/2026 | 2 pm | ia | 15 | 10 | 0 | — | 
2026-05-13 | 12:15 | Gerene | VICTOR GARCIA | (909) 380-2108 | 10425 El Rancho Dr Whittier CA 90606 |  | 05/13/2026 | 7PM | transfer | 0 | 0 | 0 | — | Interested ADU.
2026-05-13 | 12:24 | Jhen | TROY/JULIE WALLACE | (714) 812-8502 | 319 Jacaranda Pl, Fullerton, CA 92832 |  | 05/13/2026 | 6pm | ia | 15 | 10 | 0 | — | CB after an hour.
2026-05-13 | 15:56 | Ivy | ANDREW RAGLAND | (909) 510-0745 | 14976 Edgewood Dr, Eastvale, CA 92880 |  | 05/14/2026 | 1pm | transfer | 0 | 0 | 0 | — | 
2026-05-13 | 16:03 | Gerene | KUMAR SIVASANKARA | (909) 248-8989 | 7861 Garden Park St, Chino, CA 91708 |  | 05/14/2026 | 11PM | transfer | 0 | 0 | 0 | — | 
2026-05-13 | 16:41 | Aiza | JAMES HEADLEY | (714) 321-3667 | 6702 Trask Ave, Westminster, CA 92683 |  | 05/14/2026 | 5:00 | transfer | 0 | 0 | 0 | — | Garage conversion.
2026-05-13 | 19:22 | Gerene | JIM NASER / MYLINE | (661) 360-7347 | 26945 Cuatro Milpas St Valencia CA 91354 |  | 5/14/2026 | 9-10 AM | pending | 0 | 0 | 0 | — | Didn't speak to exact HO; will likely be interested. House is like a health care facility.
2026-05-14 | 10:41 | Rein | ROBERT POWERS | (714) 631-5138 | 8100 Slauson Ave, Montebello, CA 90640 |  | 05/14/2026 | 1-2 pm | transfer | 0 | 0 | 0 | — | 
2026-05-14 | 11:33 | Arlene | JOHNLINDA ROSS | (818) 621-5210 | 5720 Rista Dr, Agoura Hills, CA 91301 |  | 05/14/2026 | 5PM | transfer | 0 | 0 | 0 | — | More space; extra room/gaming.
2026-05-14 | 11:46 | Gerene | BRIAN WEAR | (818) 653-9382 | 7325 Hillrose St, Tujunga, CA 91042 |  | 05/15/2026 | 4PM | transfer | 0 | 0 | 0 | — | 
2026-05-14 | 12:38 | Arlene | REGULO TOLENTINO | (714) 308-6006 | 10321 Par Ln, Garden Grove, CA 92840 |  | 05/14/2026 | 5PM | transfer | 0 | 0 | 0 | — | ADU consultation.
2026-05-14 | 12:51 | Jhen | MUTASHA WARREN | (661) 480-3861 | 3341 W Avenue J4, Lancaster, CA 93536 |  | 05/14/2026 |  | transfer | 0 | 0 | 0 | — | 
2026-05-14 | 13:02 | Aiza | LUIS VARGAS husband / Maria Gomez - wife | (213) 268-5052 | 4551 Parton Ct, Lancaster, CA 93536 |  | 05/17/2026 | 1:00 | dnc | 0 | 0 | 0 | — | Garage conversion.
2026-05-14 | 14:35 | Mac | FLOR SPRADLIN | (661) 485-9776 | 45302 Date Ave, Lancaster, CA 93534 |  | 05/15/2026 | 10:00am | transfer | 0 | 0 | 0 | — | 
2026-05-14 | 14:56 | Jennifer Alobin | Ladonna Moore | (310) 493-8528 | 10791 Capistrano Ave Lenwood Ca 90262 |  | 05/18/2026 | 11AM | pending | 0 | 0 | 0 | — | Wants more info; CB Monday for transfer.
2026-05-14 | 15:19 | Gerene | ROBERT FITZGERALD | (805) 297-4364 | 28830 Startree Ln Santa Clarita CA 91390 |  | 5/15/2026 | 6:30 PM | transfer | 0 | 0 | 0 | — | Interested in ADU.
2026-05-14 | 17:25 | Arlene | MAYRA ESCOBAR | (323) 663-9814 | 407 N Normandie Ave, Los Angeles, CA 90004 |  | 05/15/2026 | 5pm | pending | 0 | 0 | 0 | — | Wants additional room — 2nd floor. Schedule after work.
2026-05-14 | 17:38 | Nikita | CARLOS GARCIA | (925) 352-1503 | 42349 61st St W, Lancaster, CA 93536 |  | 05/17/2026 | 11am | pending | 0 | 0 | 0 | — | 
`;

  const leads = [];
  let seq = 0;
  LEADS_RAW.trim().split("\n").forEach(line => {
    const parts = line.split("|").map(s => s.trim());
    // Expected v3 layout (15 fields):
    // date | time | agent | customer | phone | address | project | appt_date | appt_time | status | client$ | spiff | tl_bonus | tl_recipient | remarks
    if (parts.length < 14) return;
    const [date, time, agentName, customer, phone, address, project, apptDate, apptTime, status, , spiff, tlBonus, tlRecipient, remarks] = parts;
    const agent = nameToAgent[resolveName(agentName)];
    if (!agent) {
      console.warn("Unknown agent in seed:", agentName);
      return;
    }
    const tlRec = (tlRecipient && tlRecipient !== "—") ? nameToAgent[resolveName(tlRecipient)] : null;
    // Compose notes: project + address + remarks if present
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
      client_commission: 0, // recomputed by U.recomputeCommissions on load
      spiff: Number(spiff) || 0,
      tl_bonus: Number(tlBonus) || 0,
      tl_recipient_id: tlRec ? tlRec.id : null,
      appointment_date: apptDate || null,
      appointment_time: apptTime || null,
      notes: noteBits.join(" · "),
    });
  });

  // ---- Apply IA tier commissions ----
  // Mirrors U.recomputeCommissions. Inlined so data.js is self-contained and
  // doesn't depend on utils.js load order. Transfers and confirmeds stay at 0
  // since this campaign's rate_transfer and rate_confirmed are both 0.
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
        // 4th+ IA stays at 0
      });
    });
  }

  // ---- Shift logs (v3 daily attendance) ----
  const SHIFTS = [
    ["2026-03-23", 7], ["2026-03-24", 6], ["2026-03-25", 9], ["2026-03-26", 9], ["2026-03-27", 11],
    ["2026-03-30", 9], ["2026-03-31", 11],
    ["2026-04-01", 9], ["2026-04-03", 11],
    ["2026-04-06", 15], ["2026-04-07", 15], ["2026-04-09", 15], ["2026-04-10", 15],
    ["2026-04-13", 17], ["2026-04-14", 16], ["2026-04-15", 17], ["2026-04-16", 16], ["2026-04-17", 15],
    ["2026-04-20", 16], ["2026-04-21", 11], ["2026-04-22", 14], ["2026-04-23", 12], ["2026-04-24", 11],
    ["2026-04-27", 14], ["2026-04-28", 13], ["2026-04-29", 13], ["2026-04-30", 10],
    ["2026-05-01", 10], ["2026-05-04", 13], ["2026-05-05", 11], ["2026-05-06", 10], ["2026-05-07", 12], ["2026-05-08", 10],
    ["2026-05-11", 12], ["2026-05-12", 12], ["2026-05-13", 12], ["2026-05-14", 12],
    ["2026-05-15", 11],
  ];
  const shift_logs = SHIFTS.map(([date, agents_on_floor], i) => ({
    id: "sl_" + i,
    campaign_id: campaign.id,
    date,
    agents_on_floor,
    notes: "",
  }));

  // ---- Profile ----
  const profile = {
    id: "u_self",
    full_name: "Jordan Vance",
    initials: "JV",
    role: "admin",
    email: "jordan@homerelief.io",
  };

  // ---- Users ----
  const users = [
    {
      id: "u_self",
      initials: "JV",
      full_name: "Jordan Vance",
      email: "jordan@homerelief.io",
      role: "admin",
      campaign_ids: [campaign.id],
      status: "active",
      last_active: new Date(TODAY).toISOString(),
      created_at: "2026-03-20T09:00:00.000Z",
    },
  ];

  // ---- Audit log ----
  const audit_log = [
    {
      id: "au_1",
      ts: "2026-03-20T09:00:00.000Z",
      actor_id: "u_self",
      actor_name: "Jordan Vance",
      kind: "campaign.create",
      category: "campaigns",
      campaign_id: campaign.id,
      campaign_name: campaign.name,
      description: `Created campaign “${campaign.name}” for ${campaign.client}`,
    },
  ];

  // ---- Export ----
  window.MOCK_DATA = {
    campaigns: [campaign],
    agents,
    leads,
    shift_logs,
    attendance: [],
    profile,
    users,
    audit_log,
    today: dayStr(TODAY),
  };
  window.MOCK_TODAY = TODAY;
})();
