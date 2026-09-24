# FESTRONIX TECHNOVA 2026 — Official Event Rubrics & Evaluation Framework

> **Department of Computer Science & Engineering | K. Ramakrishnan College of Technology (KRCT)**  
> **Theme:** Code the Ideas • Build the Tomorrow | **Tagline:** Decode, Debug & Discover  
> **Target Audience:** Engineering & Computer Science Undergraduate Students  
> **Total Grand Marks:** **100 Marks** across 3 Progressive Elimination Rounds

---

## 1. Executive Scoring & Weightage Structure

| Round | Stage Name | Focus Area | Questions / Tasks | Round Weightage | Cutoff / Advancing Target |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **Round 1** | **TECH QUIZ (Decode)** | Core Computer Science Fundamentals | 20 MCQs | **20 Marks** (20%) | **Top 30 Contestants** Advance |
| **Round 2** | **DEBUG IT (Debug)** | Code Bug Hunting & Physical IDE Execution | 3 Problems | **30 Marks** (30%) | **Top 10 Finalists** Advance |
| **Round 3** | **TECH HUNT (Discover)** | Multi-Station Technical Clue & Riddle Solving | 5 Stations | **50 Marks** (50%) | **Top 3 Winners** Declared |
| **TOTAL** | **TECHNOVA CHAMPIONSHIP** | **Overall Technical & Algorithmic Excellence** | **28 Tasks** | **100 Marks** (100%) | **1st, 2nd, 3rd Position Awards** |

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    TECHNOVA 2026 TOURNAMENT PIPELINE                         │
└──────────────────────────────────────────────────────────────────────────────┘
  Round 1: Tech Quiz (100+ Contestants)  ──► 20 MCQs (20 Mins)     [Cutoff: Top 30]
         │
         ▼
  Round 2: Debug It! (Top 30 Qualifiers) ──► 3 Problems (45 Mins)  [Cutoff: Top 10]
         │
         ▼
  Round 3: Tech Hunt (Top 10 Finalists)  ──► 5 Stations (40 Mins)  [Podium: Top 3]
```

---

## 2. Round 1: TECH QUIZ (Decode) — 20 Marks

### Objective
Assess breadth, speed, and analytical depth across core computer science and engineering disciplines through a server-randomized, time-restricted examination.

### Configuration & Constraints
* **Question Bank Source:** 100 Curated MCQs across 10 Domains (from `Festronix_TechNova_2026_Questions_Bank.xlsx`).
* **Delivered Count:** 20 Random Questions per candidate via Fisher-Yates shuffle.
* **Duration:** **20 Minutes** (Strict countdown timer with automated submission upon expiry).
* **Environment Integrity:** Fullscreen enforced; **0 Browser Extensions Policy** enforced on login.

### Domain Distribution (2 Questions per candidate from each domain)
1. Data Structures & Algorithms
2. Web Technologies & JavaScript
3. Operating Systems & Architecture
4. Database Management & SQL
5. Computer Networks & Protocols
6. OOP & Software Design Patterns
7. Programming Language Internals (C, Python, Java)
8. Cybersecurity & Cryptography
9. Cloud Computing, DevOps & AI
10. Boolean Logic & Bitwise Computations

### Scoring Matrix

| Parameter | Criteria | Awarded Marks |
| :--- | :--- | :---: |
| **Correct Option** | Candidate selects the validated correct key (A, B, C, or D). | **+1.0 Mark** |
| **Incorrect Option** | Candidate selects an incorrect key. | **0.0 Marks** (No negative marks) |
| **Unanswered / Skipped** | Question left unanswered at submission time. | **0.0 Marks** |
| **Time Efficiency Bonus** | Millisecond-precision submission timestamp recorded. | **Tie-Breaker Factor** |

### Round 1 Qualification Rule
* The top **30 scorers** on the server leaderboard qualify for Round 2.
* In the event of tied scores at the 30th cutoff position, the candidate with the lower elapsed test completion time qualifies.

---

## 3. Round 2: DEBUG IT (Debug) — 30 Marks

### Objective
Test practical debugging, compiler comprehension, memory safety, and algorithmic problem-solving by fixing broken code snippets in local IDEs and demonstrating live execution to lab coordinators.

### Configuration & Constraints
* **Problem Bank Source:** 50 Multi-Language Debugging Challenges (15 C, 15 Python, 15 Java, 5 C++/JS).
* **Assigned Problems:** **3 Problems** assigned randomly to each candidate.
* **Duration:** **45 Minutes**.
* **Verification Protocol:** Mandatory physical inspection by Lab Coordinators (`ECO-04` or `ECO-05`) authenticated with a 4-digit PIN.

### Coordinator Detailed Evaluation Rubric (10 Marks per Problem)

For each assigned problem, the lab coordinator evaluates the candidate's solution across four criteria:

```
┌────────────────────────────────────────────────────────────────────────┐
│             ROUND 2: COORDINATOR 10-MARK RUBRIC BREAKDOWN               │
├────────────────────────────┬───────────┬───────────────────────────────┤
│ Criterion                  │ Max Marks │ Evaluated Aspects             │
├────────────────────────────┼───────────┼───────────────────────────────┤
│ 1. Logic & Root Cause Fix  │  4 Marks  │ Bug accurately isolated & fixed│
│ 2. Test Output Conformance │  3 Marks  │ Output matches exact spec     │
│ 3. Code Quality & Standards│  2 Marks  │ No warnings, leaks, or hacks  │
│ 4. Verbal Viva / Defense   │  1 Mark   │ Clear explanation of the bug  │
├────────────────────────────┼───────────┼───────────────────────────────┤
│ TOTAL PER PROBLEM          │ 10 Marks  │ 3 Problems × 10 = 30 Marks    │
└────────────────────────────┴───────────┴───────────────────────────────┘
```

#### Detailed Criterion Descriptions

| Criterion | Excellent (Full Marks) | Good (Partial Marks) | Unsatisfactory (0 Marks) |
| :--- | :--- | :--- | :--- |
| **1. Root Cause Resolution (4 Marks)** | Correctly identifies and fixes the underlying syntactic/logical flaw (e.g. pointer leak, off-by-one, type mismatch). **[4 Marks]** | Partially addresses symptom with hardcoded values or suboptimal workaround. **[2 Marks]** | Bug remains present; code crashes, throws exceptions, or fails to compile. **[0 Marks]** |
| **2. Test Output Conformance (3 Marks)** | Output string, format, and return value match the expected problem specification perfectly. **[3 Marks]** | Output is correct but contains extra spacing, casing issues, or unformatted newlines. **[1.5 Marks]** | Incorrect output or segmentation fault / runtime crash. **[0 Marks]** |
| **3. Code Quality & Memory Safety (2 Marks)** | Clean syntax, proper indentation, resources freed (`free()`, `close()`), no compiler warnings. **[2 Marks]** | Code works but leaves memory leaks, unclosed streams, or sloppy indentation. **[1 Mark]** | Code contains major memory bugs or bad anti-patterns. **[0 Marks]** |
| **4. Live Explanation Viva (1 Mark)** | Candidate articulates clearly *what* the bug was and *why* their fix resolves it within 30 seconds. **[1 Mark]** | Vague or hesitant explanation; relies on trial-and-error without understanding. **[0.5 Marks]** | Cannot explain what change was made. **[0 Marks]** |

### Round 2 Qualification Rule
* The top **10 scorers** on the cumulative leaderboard (Round 1 + Round 2) qualify for the Grand Finale (Round 3).

---

## 4. Round 3: TECH HUNT (Discover) — 50 Marks

### Objective
Test rapid lateral thinking, algorithmic riddles, cryptography, systems hardware clues, and physical campus checkpoint traversal under competitive pressure.

### Configuration & Constraints
* **Clue Bank Source:** 50 Station Riddles with secret cryptographic/hardware answer keys.
* **Stations to Complete:** **5 Sequential Stations**.
* **Duration:** **40 Minutes**.
* **Progression:** Linear unlock (Station $N+1$ unlocks only after successfully answering Station $N$).

### Scoring Matrix per Station (10 Marks × 5 Stations = 50 Marks)

| Station Action | Condition / Criteria | Point Adjustment |
| :--- | :--- | :---: |
| **Correct Answer Submitted** | Candidate enters matching case-insensitive secret key on first try. | **+10 Marks** |
| **Hint Requested (Roadmap Clue)** | Candidate clicks "Unlock Roadmap Hint" to reveal station location clue. | **-2 Marks Penalty** |
| **Net Station Score (With Hint)** | Station solved successfully after viewing the roadmap hint. | **+8 Marks** |
| **Incorrect Submission** | Wrong key entered (candidates may retry without point penalty). | **0 Marks (Retry permitted)** |
| **Unsolved Station** | Station not reached or unsolved before 40-minute timer expires. | **0 Marks** |

### Speed Multiplier & Bonus for Round 3
* **Speed Rank Recording:** The platform server logs the exact millisecond timestamp when Station 5 is submitted.
* **First Finisher Bonus:** In the event of a tie in total points, the finalist with the earliest completion timestamp claims precedence.

---

## 5. Leaderboard Ranking & Qualification Filtering Engine

The TechNova platform uses an automated multi-stage qualification and ranking engine (`computeLeaderboardData()`) that filters, sorts, and determines participant eligibility after every round.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                          TOURNAMENT RANK & FILTER PROGRESSION                               │
├─────────────────┬──────────────────────┬──────────────────────┬─────────────────────────────┤
│ Tournament Tier │ Target Participants  │ Filtering Algorithm  │ Advancement Outcome         │
├─────────────────┼──────────────────────┼──────────────────────┼─────────────────────────────┤
│ 1. Tech Quiz    │ All Registered       │ Rank 1 to 30         │ Top 30 earn `qualifiedR2`   │
│    (Round 1)    │ (100+ Contestants)   │ based on R1 Score    │ (Rank > 30 = Eliminated)    │
├─────────────────┼──────────────────────┼──────────────────────┼─────────────────────────────┤
│ 2. Debug It!    │ Top 30 Qualifiers    │ Rank 1 to 10         │ Top 10 earn `qualifiedR3`   │
│    (Round 2)    │ (`qualifiedR2=true`) │ based on R1+R2 Score │ (Rank > 10 = Eliminated)    │
├─────────────────┼──────────────────────┼──────────────────────┼─────────────────────────────┤
│ 3. Tech Hunt    │ Top 10 Finalists     │ Rank 1 to 3          │ 🥇 1st Place (Champion)     │
│    (Round 3)    │ (`qualifiedR3=true`) │ based on Grand Total │ 🥈 2nd Place (Runner-Up)    │
│                 │                      │ (R1+R2+R3 / 100 pts) │ 🥉 3rd Place (2nd Runner-Up)│
└─────────────────┴──────────────────────┴──────────────────────┴─────────────────────────────┘
```

### 5.1 Round-by-Round Filtering & Sorting Rules

#### A. Round 1 Ranking & Filtering (Rank 1 to 30 Cutoff)
* **Eligible Pool:** All registered candidates who started/submitted Round 1.
* **Sort Key 1 (Primary):** `r1Score` **DESC** (Max 20 marks).
* **Sort Key 2 (Tie-Breaker 1 - Speed):** `r1Duration` **ASC** (Milliseconds between `startedAt` and `submittedAt`).
* **Sort Key 3 (Tie-Breaker 2 - Timestamp):** `r1SubmittedAt` **ASC** (Earliest submission clock time).
* **Filter Rule:** Participants with `Rank <= 30` (or configured `round1QualifyCount`) receive `qualifiedR2 = true` and unlocked access to Round 2. All remaining participants are classified as `Eliminated in Round 1`.

#### B. Round 2 Ranking & Filtering (Rank 1 to 10 Finalist Cutoff)
* **Eligible Pool:** Strictly candidates who passed Round 1 (`qualifiedR2 == true`). Non-qualifiers cannot be scored in Round 2.
* **Sort Key 1 (Primary):** Cumulative $(R1 + R2)$ Score **DESC** (Max 50 marks).
* **Sort Key 2 (Tie-Breaker 1 - Debug Mastery):** Higher isolated `r2Score` **DESC** (Max 30 marks).
* **Sort Key 3 (Tie-Breaker 2 - Verification Speed):** `r2LatestVerified` **ASC** (Earliest coordinator verification timestamp).
* **Sort Key 4 (Tie-Breaker 3 - R1 Precedence):** Higher Round 1 Rank (`r1Rank` ASC).
* **Filter Rule:** Participants with `Rank <= 10` (or configured `round2QualifyCount`) receive `qualifiedR3 = true` and access to the Grand Finale (Round 3). Candidates outside the top 10 are classified as `Eliminated in Round 2`.

#### C. Round 3 Grand Finale & Podium Ranking (Rank 1, 2, 3)
* **Eligible Pool:** Strictly the Top 10 Grand Finalists (`qualifiedR3 == true`).
* **Sort Key 1 (Primary):** Grand Total Cumulative Score $(R1 + R2 + R3)$ **DESC** (Max 100 marks).
* **Sort Key 2 (Tie-Breaker 1):** Higher `r2Score` (Debugging precision under pressure).
* **Sort Key 3 (Tie-Breaker 2):** Fewer Hint Penalties incurred in Round 3.
* **Sort Key 4 (Tie-Breaker 3):** `r3SubmittedAt` **ASC** (Earliest completion timestamp of Station 5).
* **Sort Key 5 (Tie-Breaker 4):** Faster Round 1 test completion speed.
* **Podium Classification:**
  * **Rank 1:** 🥇 **TechNova 2026 Champion**
  * **Rank 2:** 🥈 **First Runner-Up**
  * **Rank 3:** 🥉 **Second Runner-Up**
  * **Ranks 4 to 10:** 🎖️ **Grand Finalists**

---

### 5.2 Live Portal Leaderboard Filtering Modes

The Coordinator and Admin Portals offer 4 real-time telemetry filtering views:

| Filter Tab | Data Subset | Sorting Criterion | Primary Use Case |
| :--- | :--- | :--- | :--- |
| **`ALL` (Overall Standings)** | All registered participants ($N=100+$) | Tiered: R3 Qualifiers $\to$ R2 Qualifiers $\to$ R1 Eliminated, then Total Score DESC | Symposium overview & active status monitoring |
| **`R1` (Round 1 Results)** | All participants who took Quiz | `r1Score` DESC, `r1Duration` ASC | Cutoff verification for Top 30 Round 2 qualifiers |
| **`R2` (Round 2 Qualifiers)** | Filtered to `qualifiedR2 == true` (30 contestants) | $(R1 + R2)$ DESC, `r2Score` DESC, `r2LatestVerified` ASC | Tracking live lab verifications & Top 10 Finalist cutoff |
| **`R3` (Round 3 Podium)** | Filtered to `qualifiedR3 == true` (10 finalists) | Grand Total $(R1 + R2 + R3)$ DESC, R3 Speed ASC | Live tracking of campus treasure hunt & winner declaration |
| **Live Search Query** | Matches substring against `id`, `name`, or `college` | Preserves active tab's sort order | Fast candidate lookup during coordinator viva verification |

---

## 6. Master Tie-Breaking Hierarchy

If two or more candidates have identical scores on the final leaderboard, the winner is determined using the following strict sequential rules:

```mermaid
flowchart TD
    Start[Identical Cumulative Scores] --> Rule1{1. Higher Score in Round 2 Debugging?}
    Rule1 -- YES --> Win1[Candidate with higher R2 score wins]
    Rule1 -- NO (Tied) --> Rule2{2. Fewer Hints Used in Round 3?}
    Rule2 -- YES --> Win2[Candidate with fewer hint penalties wins]
    Rule2 -- NO (Tied) --> Rule3{3. Faster Time in Round 3 Tech Hunt?}
    Rule3 -- YES --> Win3[Candidate with earlier R3 completion wins]
    Rule3 -- NO (Tied) --> Rule4{4. Faster Time in Round 1 Tech Quiz?}
    Rule4 -- YES --> Win4[Candidate with faster R1 exam completion wins]
    Rule4 -- NO (Tied) --> Rule5[Joint Position Awarded / Sudden Death Debug Problem]
```

---

## 7. Code of Conduct, Anti-Cheat & Penalties

To ensure 100% integrity across all computer laboratories, the following automated and coordinator-enforced rules apply:

| Infraction | Detection Mechanism | Penalty / Action |
| :--- | :--- | :--- |
| **Active Browser Extensions** | Automated client-side probe ([useExtensionDetector.js](file:///o:/Festronix2k26_TechNova/client/src/hooks/useExtensionDetector.js)) | **Login Input Locked.** Contestant cannot type or sign in until all extensions are removed/disabled. |
| **Tab Switching / Window Unfocus** | `document.hidden` browser telemetry logged to `/api/anticheat/log` | **Warning on 1st & 2nd offense.** 3rd offense triggers coordinator review and **-5 Marks penalty**. |
| **DevTools / Inspect Shortcut (F12, Ctrl+Shift+I)** | Event key listener intercepted & blocked | Keystroke cancelled; telemetry signal dispatched to server. |
| **External AI Assistance (ChatGPT, Monica, etc.)** | Extension probe + physical proctor monitoring | **Immediate Disqualification (DQ)** from tournament. |
| **Sharing Secret Keys / Clues in Round 3** | Coordinator surveillance & audit log check | **Immediate Disqualification** of both involved teams. |

---

## 8. Coordinator PIN Verification Protocol

All Lab Coordinators must adhere to the following 5-step grading protocol for Round 2:

1. **Verify Identity:** Check contestant badge against system ID (`TN2026-xxx`).
2. **Terminal Inspection:** Require the student to compile and run their code in their IDE / terminal.
3. **Inspect Output:** Verify output against the problem's expected output specified in [`Festronix_TechNova_2026_Questions_Bank.xlsx`](file:///o:/Festronix2k26_TechNova/Festronix_TechNova_2026_Questions_Bank.xlsx).
4. **Conduct 30-Second Viva:** Ask candidate to explain the line(s) changed and why the bug occurred.
5. **Enter PIN & Marks:** Open Coordinator Modal on participant workstation or coordinator portal, input assigned 4-digit PIN (e.g. `1504` for `ECO-04`), select awarded marks (0–10), and submit.

---

## 9. Awards & Certificate Allocation

| Award Category | Qualification Criteria | Recognition |
| :--- | :--- | :--- |
| 🥇 **TechNova 2026 Champion (1st Place)** | Highest Total Cumulative Score (R1 + R2 + R3) | Winner Trophy + Certificate of Excellence + Cash Award |
| 🥈 **First Runner-Up (2nd Place)** | 2nd Highest Cumulative Score | Trophy + Certificate of Excellence + Cash Award |
| 🥉 **Second Runner-Up (3rd Place)** | 3rd Highest Cumulative Score | Trophy + Certificate of Excellence + Cash Award |
| 🎖️ **Grand Finalist (Top 10)** | Qualified for and competed in Round 3 (Tech Hunt) | Certificate of Merit |
| 📜 **Round 2 Qualifier (Top 30)** | Advanced past Round 1 (Tech Quiz) | Certificate of Participation & Round 2 Qualification |
| 📄 **All Participants** | Successfully submitted Round 1 | Certificate of Participation |

---

*Official Event Evaluation Rubrics Approved for Festronix 2026 — TechNova by the Department of Computer Science & Engineering, K. Ramakrishnan College of Technology.*
