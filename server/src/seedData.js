// TECHNOVA 2026 OFFICIAL COMPETITION QUESTION SEED BANK
// 100 CS MCQs (Round 1), 50 Debugging Problems (Round 2), 50 Tech Hunt Riddles (Round 3)

export const seedQuestions = [
  // --- DOMAIN 1: DATA STRUCTURES & ALGORITHMS (10 Questions) ---
  {
    questionId: "MCQ-DSA-001",
    questionText: "What is the worst-case space complexity of Quicksort algorithm when implemented recursively without tail call optimization?",
    category: "Data Structures & Algorithms",
    difficulty: "MEDIUM",
    options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
    correctOption: 2,
    explanation: "In the worst case (e.g. sorted input with poor pivot), recursion stack depth reaches N."
  },
  {
    questionId: "MCQ-DSA-002",
    questionText: "In a binary search tree (BST) with N nodes, what is the maximum possible height of the tree?",
    category: "Data Structures & Algorithms",
    difficulty: "EASY",
    options: ["N - 1", "log2(N)", "N / 2", "2 * N"],
    correctOption: 0,
    explanation: "A degenerate (skewed) BST becomes a single linked list of height N - 1."
  },
  {
    questionId: "MCQ-DSA-003",
    questionText: "Which data structure allows insertion and deletion at both ends in O(1) time?",
    category: "Data Structures & Algorithms",
    difficulty: "EASY",
    options: ["Queue", "Stack", "Deque", "Priority Queue"],
    correctOption: 2,
    explanation: "A Double-Ended Queue (Deque) supports O(1) operations at both front and back."
  },
  {
    questionId: "MCQ-DSA-004",
    questionText: "If a hash table uses linear probing with open addressing, what problem arises when keys cluster together?",
    category: "Data Structures & Algorithms",
    difficulty: "MEDIUM",
    options: ["Secondary Clustering", "Primary Clustering", "Hash Collision Spill", "Overflow Chain"],
    correctOption: 1,
    explanation: "Linear probing suffers from primary clustering where long contiguous blocks of occupied slots build up."
  },
  {
    questionId: "MCQ-DSA-005",
    questionText: "Which algorithm is used to find the shortest path from a single source vertex to all other vertices in a weighted graph with negative edge weights?",
    category: "Data Structures & Algorithms",
    difficulty: "MEDIUM",
    options: ["Dijkstra's Algorithm", "Bellman-Ford Algorithm", "Floyd-Warshall Algorithm", "Kruskal's Algorithm"],
    correctOption: 1,
    explanation: "Bellman-Ford algorithm handles negative edge weights and detects negative cycles."
  },
  {
    questionId: "MCQ-DSA-006",
    questionText: "What is the time complexity of building a Binary Heap from an unsorted array of N elements?",
    category: "Data Structures & Algorithms",
    difficulty: "MEDIUM",
    options: ["O(N log N)", "O(N)", "O(log N)", "O(N^2)"],
    correctOption: 1,
    explanation: "Bottom-up heap construction (heapify) takes linear time O(N)."
  },
  {
    questionId: "MCQ-DSA-007",
    questionText: "Which graph traversal technique uses a Queue data structure?",
    category: "Data Structures & Algorithms",
    difficulty: "EASY",
    options: ["Depth First Search (DFS)", "Breadth First Search (BFS)", "Preorder Traversal", "Postorder Traversal"],
    correctOption: 1,
    explanation: "BFS explores nodes level-by-level using a FIFO Queue."
  },
  {
    questionId: "MCQ-DSA-008",
    questionText: "What is the maximum number of edges in an undirected simple graph with V vertices?",
    category: "Data Structures & Algorithms",
    difficulty: "EASY",
    options: ["V * (V - 1)", "V * (V - 1) / 2", "V^2", "2 * V"],
    correctOption: 1,
    explanation: "Maximum edges = V choose 2 = V * (V - 1) / 2."
  },
  {
    questionId: "MCQ-DSA-009",
    questionText: "In Dynamic Programming, what property must a problem possess to apply memoization efficiently?",
    category: "Data Structures & Algorithms",
    difficulty: "MEDIUM",
    options: ["Greedy Choice Property", "Overlapping Subproblems", "Strict Monotonicity", "Divide and Conquer Property"],
    correctOption: 1,
    explanation: "Dynamic programming requires overlapping subproblems and optimal substructure."
  },
  {
    questionId: "MCQ-DSA-010",
    questionText: "Which data structure is used to check balanced parentheses in an expression?",
    category: "Data Structures & Algorithms",
    difficulty: "EASY",
    options: ["Array", "Queue", "Stack", "Linked List"],
    correctOption: 2,
    explanation: "A LIFO Stack pushes opening brackets and pops matching closing brackets."
  },

  // --- DOMAIN 2: WEB DEVELOPMENT & JAVASCRIPT (10 Questions) ---
  {
    questionId: "MCQ-WEB-011",
    questionText: "What will `console.log(typeof null)` output in JavaScript?",
    category: "Web Development & JS",
    difficulty: "EASY",
    options: ["'null'", "'undefined'", "'object'", "'boolean'"],
    correctOption: 2,
    explanation: "Due to legacy JS design from 1995, typeof null evaluates to 'object'."
  },
  {
    questionId: "MCQ-WEB-012",
    questionText: "In the JavaScript Event Loop, which queue has higher execution priority?",
    category: "Web Development & JS",
    difficulty: "MEDIUM",
    options: ["Macrotask Queue (setTimeout)", "Microtask Queue (Promises / process.nextTick)", "Render Queue", "IO Callback Queue"],
    correctOption: 1,
    explanation: "All microtasks in the microtask queue are drained before the event loop moves to the next macrotask."
  },
  {
    questionId: "MCQ-WEB-013",
    questionText: "Which CSS box-sizing property value includes padding and border in the element's total width and height?",
    category: "Web Development & JS",
    difficulty: "EASY",
    options: ["content-box", "border-box", "padding-box", "flex-box"],
    correctOption: 1,
    explanation: "border-box tells the browser to account for padding and border in the element's declared size."
  },
  {
    questionId: "MCQ-WEB-014",
    questionText: "What is the HTTP status code for '304 Not Modified'?",
    category: "Web Development & JS",
    difficulty: "MEDIUM",
    options: ["Resource moved permanently", "Cached version valid, no body transferred", "Unauthorized access", "Gateway Timeout"],
    correctOption: 1,
    explanation: "HTTP 304 indicates that requested resource has not been modified since last fetch."
  },
  {
    questionId: "MCQ-WEB-015",
    questionText: "What will `0.1 + 0.2 === 0.3` evaluate to in JavaScript?",
    category: "Web Development & JS",
    difficulty: "EASY",
    options: ["true", "false", "NaN", "TypeError"],
    correctOption: 1,
    explanation: "Floating-point precision issues make 0.1 + 0.2 equal 0.30000000000000004."
  },
  {
    questionId: "MCQ-WEB-016",
    questionText: "Which feature prevents Cross-Site Scripting (XSS) by instructing browsers which scripts are allowed to execute?",
    category: "Web Development & JS",
    difficulty: "MEDIUM",
    options: ["CORS", "Content Security Policy (CSP)", "CSRF Token", "HTTPS Encryption"],
    correctOption: 1,
    explanation: "CSP header dictates trusted domains and restrictions for script loading."
  },
  {
    questionId: "MCQ-WEB-017",
    questionText: "What does the `async` attribute on a script tag do?",
    category: "Web Development & JS",
    difficulty: "EASY",
    options: [
      "Defers script execution until HTML parsing completes",
      "Downloads script in background and executes immediately upon completion",
      "Stops HTML parsing completely until script downloads",
      "Converts script into a Web Worker"
    ],
    correctOption: 1,
    explanation: "async fetches the script asynchronously and executes as soon as it's downloaded."
  },
  {
    questionId: "MCQ-WEB-018",
    questionText: "In React, what is the key purpose of the virtual DOM?",
    category: "Web Development & JS",
    difficulty: "MEDIUM",
    options: [
      "To store database schemas in browser memory",
      "To batch and minimize direct expensive real DOM mutations",
      "To bypass JavaScript security constraints",
      "To compile JSX into assembly code"
    ],
    correctOption: 1,
    explanation: "Virtual DOM performs diffing algorithms to compute minimal actual DOM updates."
  },
  {
    questionId: "MCQ-WEB-019",
    questionText: "Which JavaScript operator checks whether a property exists in an object or its prototype chain?",
    category: "Web Development & JS",
    difficulty: "MEDIUM",
    options: ["hasOwnProperty()", "in", "typeof", "instanceof"],
    correctOption: 1,
    explanation: "The 'in' operator evaluates true if the property is present in the object or prototype chain."
  },
  {
    questionId: "MCQ-WEB-020",
    questionText: "What is the primary difference between LocalStorage and SessionStorage?",
    category: "Web Development & JS",
    difficulty: "EASY",
    options: [
      "LocalStorage capacity is 1MB, SessionStorage is 1GB",
      "LocalStorage persists across tab/browser restarts, SessionStorage clears when tab closes",
      "LocalStorage is stored on server, SessionStorage on client",
      "LocalStorage supports JSON, SessionStorage only text"
    ],
    correctOption: 1,
    explanation: "SessionStorage data is cleared as soon as the browser tab session ends."
  },

  // --- DOMAIN 3: OPERATING SYSTEMS & SYSTEM ARCHITECTURE (10 Questions) ---
  {
    questionId: "MCQ-OS-021",
    questionText: "Which condition is NOT one of Coffman's four necessary conditions for deadlock?",
    category: "Operating Systems",
    difficulty: "MEDIUM",
    options: ["Mutual Exclusion", "Hold and Wait", "Preemption Allowed", "Circular Wait"],
    correctOption: 2,
    explanation: "No Preemption (preemption is NOT allowed) is the required deadlock condition."
  },
  {
    questionId: "MCQ-OS-022",
    questionText: "What is Belady's Anomaly in operating systems page replacement?",
    category: "Operating Systems",
    difficulty: "MEDIUM",
    options: [
      "Increasing page frames decreases page faults",
      "Increasing page frames increases page faults in FIFO",
      "CPU utilization drops to zero during paging",
      "Disk I/O locks the main memory bus"
    ],
    correctOption: 1,
    explanation: "Belady's Anomaly proves FIFO page replacement can cause more page faults when allocated more frames."
  },
  {
    questionId: "MCQ-OS-023",
    questionText: "What occurs during a CPU Context Switch?",
    category: "Operating Systems",
    difficulty: "EASY",
    options: [
      "The operating system reboots the kernel",
      "State of running thread/process is saved and state of next thread is restored",
      "Hard disk sector indices are updated",
      "RAM contents are flushed to ROM"
    ],
    correctOption: 1,
    explanation: "Context switching stores registers and CPU state so execution can resume later."
  },
  {
    questionId: "MCQ-OS-024",
    questionText: "What is the main advantage of Threads over Processes?",
    category: "Operating Systems",
    difficulty: "EASY",
    options: [
      "Threads have isolated address spaces",
      "Threads share address space resulting in faster communication and lighter context switching",
      "Threads cannot experience race conditions",
      "Threads run without operating system scheduling"
    ],
    correctOption: 1,
    explanation: "Threads of the same process share code, memory, and resources."
  },
  {
    questionId: "MCQ-OS-025",
    questionText: "In virtual memory management, what is a 'Page Fault'?",
    category: "Operating Systems",
    difficulty: "EASY",
    options: [
      "A fatal hardware crash in physical RAM",
      "An exception raised when a requested memory page is not present in physical RAM",
      "An unauthorized memory access violation",
      "A corrupt disk sector"
    ],
    correctOption: 1,
    explanation: "Page Fault occurs when referenced virtual page is not loaded in physical RAM."
  },
  {
    questionId: "MCQ-OS-026",
    questionText: "Which scheduling algorithm can cause starvation for low-priority processes?",
    category: "Operating Systems",
    difficulty: "EASY",
    options: ["Round Robin", "Priority Scheduling", "First-Come First-Served", "Shortest Remaining Time First with Aging"],
    correctOption: 1,
    explanation: "Indefinite blocking (starvation) occurs in priority scheduling when high priority processes constantly arrive."
  },
  {
    questionId: "MCQ-OS-027",
    questionText: "What is Thrashing in an operating system?",
    category: "Operating Systems",
    difficulty: "MEDIUM",
    options: [
      "High CPU clock speed boosting",
      "OS spends more time swapping pages in and out of disk than executing instructions",
      "Deleting files concurrently",
      "Kernel panic caused by null pointer"
    ],
    correctOption: 1,
    explanation: "Thrashing occurs when active working set exceeds physical RAM, causing continuous page swapping."
  },
  {
    questionId: "MCQ-OS-028",
    questionText: "What is the primary role of a Mutex in concurrent programming?",
    category: "Operating Systems",
    difficulty: "EASY",
    options: [
      "To accelerate floating-point math",
      "To enforce mutual exclusion so only one thread accesses a critical section at a time",
      "To dynamically allocate heap memory",
      "To schedule disk read/write requests"
    ],
    correctOption: 1,
    explanation: "A Mutex (Mutual Exclusion lock) serializes access to shared critical resources."
  },
  {
    questionId: "MCQ-OS-029",
    questionText: "What is a 'Zombie Process' in Unix-like systems?",
    category: "Operating Systems",
    difficulty: "MEDIUM",
    options: [
      "A process running without a process ID",
      "A process that has completed execution but its exit status has not been read by its parent",
      "A process that consumes 100% CPU constantly",
      "A process infected by malware"
    ],
    correctOption: 1,
    explanation: "Zombie processes maintain a Process Table entry until parent calls wait()."
  },
  {
    questionId: "MCQ-OS-030",
    questionText: "Which memory allocation technique suffers from external fragmentation?",
    category: "Operating Systems",
    difficulty: "MEDIUM",
    options: ["Paging", "Contiguous Dynamic Memory Allocation", "Fixed Partitioning", "Segmented Paging"],
    correctOption: 1,
    explanation: "Variable-size contiguous allocation leaves scattered free memory spaces too small to fulfill requests."
  },

  // --- DOMAIN 4: DATABASE MANAGEMENT & SQL (10 Questions) ---
  {
    questionId: "MCQ-DBMS-031",
    questionText: "In SQL, what is the result of comparing any value to `NULL` using the `=` operator (e.g., `WHERE score = NULL`)?",
    category: "Database & SQL",
    difficulty: "EASY",
    options: ["TRUE", "FALSE", "UNKNOWN (Evaluates to empty result)", "Syntax Error"],
    correctOption: 2,
    explanation: "SQL uses 3-valued logic. Comparisons to NULL return UNKNOWN. Use `IS NULL` instead."
  },
  {
    questionId: "MCQ-DBMS-032",
    questionText: "Which ACID property guarantees that database transactions are committed permanently even in the event of system power failure?",
    category: "Database & SQL",
    difficulty: "EASY",
    options: ["Atomicity", "Consistency", "Isolation", "Durability"],
    correctOption: 3,
    explanation: "Durability guarantees committed transaction records persist in durable storage."
  },
  {
    questionId: "MCQ-DBMS-033",
    questionText: "What type of JOIN returns all records from the left table and matched records from the right table?",
    category: "Database & SQL",
    difficulty: "EASY",
    options: ["INNER JOIN", "LEFT OUTER JOIN", "RIGHT OUTER JOIN", "FULL OUTER JOIN"],
    correctOption: 1,
    explanation: "LEFT JOIN retains all rows from the left table regardless of right table matches."
  },
  {
    questionId: "MCQ-DBMS-034",
    questionText: "What Normal Form eliminates transitive dependencies among non-prime attributes?",
    category: "Database & SQL",
    difficulty: "MEDIUM",
    options: ["1NF", "2NF", "3NF", "BCNF"],
    correctOption: 2,
    explanation: "Third Normal Form (3NF) requires 2NF and no transitive dependencies."
  },
  {
    questionId: "MCQ-DBMS-035",
    questionText: "Why are B-Trees or B+ Trees preferred over Binary Search Trees for database disk indexing?",
    category: "Database & SQL",
    difficulty: "MEDIUM",
    options: [
      "B-Trees require less memory",
      "B-Trees have high fan-out, reducing number of disk I/O reads",
      "B-Trees store data in string format",
      "Binary search trees do not support range queries"
    ],
    correctOption: 1,
    explanation: "B+ trees have a high branching factor, minimizing disk block access during lookups."
  },
  {
    questionId: "MCQ-DBMS-036",
    questionText: "What is a 'Phantom Read' anomaly in SQL transaction isolation levels?",
    category: "Database & SQL",
    difficulty: "HARD",
    options: [
      "Reading uncommitted data from another transaction",
      "Re-reading a row and finding modified values",
      "Re-executing a query and finding new rows inserted by another committed transaction",
      "A database deadlock exception"
    ],
    correctOption: 2,
    explanation: "Phantom Reads occur when new rows meeting search criteria are inserted by a concurrent transaction."
  },
  {
    questionId: "MCQ-DBMS-037",
    questionText: "Which SQL clause is used to filter records after an aggregate `GROUP BY` calculation?",
    category: "Database & SQL",
    difficulty: "EASY",
    options: ["WHERE", "HAVING", "ORDER BY", "FILTER"],
    correctOption: 1,
    explanation: "HAVING filters aggregated groups, whereas WHERE filters individual rows prior to grouping."
  },
  {
    questionId: "MCQ-DBMS-038",
    questionText: "What is a Candidate Key in relational database design?",
    category: "Database & SQL",
    difficulty: "MEDIUM",
    options: [
      "A key that contains NULL values",
      "A minimal superkey capable of uniquely identifying a record",
      "A key imported from an external table",
      "A synthetic incrementing integer"
    ],
    correctOption: 1,
    explanation: "A Candidate Key is any minimal set of fields uniquely identifying a row without redundant columns."
  },
  {
    questionId: "MCQ-DBMS-039",
    questionText: "What is the primary difference between relational databases and NoSQL document databases like MongoDB?",
    category: "Database & SQL",
    difficulty: "EASY",
    options: [
      "NoSQL databases do not support indexes",
      "NoSQL stores schemaless hierarchical documents (JSON/BSON), RDBMS stores rigid tabular schemas",
      "Relational databases cannot scale beyond 1MB",
      "NoSQL databases require C++ drivers"
    ],
    correctOption: 1,
    explanation: "MongoDB stores dynamic JSON-like BSON documents without strict predefined table schemas."
  },
  {
    questionId: "MCQ-DBMS-040",
    questionText: "Which command removes all rows from a table instantly without logging individual row deletions?",
    category: "Database & SQL",
    difficulty: "MEDIUM",
    options: ["DELETE FROM table;", "TRUNCATE TABLE table;", "DROP TABLE table;", "REMOVE TABLE table;"],
    correctOption: 1,
    explanation: "TRUNCATE deallocates data pages rapidly and cannot be filtered with WHERE."
  },

  // --- DOMAIN 5: NETWORKING & PROTOCOLS (10 Questions) ---
  {
    questionId: "MCQ-NET-041",
    questionText: "At which layer of the OSI model does the Internet Protocol (IP) operate?",
    category: "Computer Networks",
    difficulty: "EASY",
    options: ["Data Link Layer (Layer 2)", "Network Layer (Layer 3)", "Transport Layer (Layer 4)", "Application Layer (Layer 7)"],
    correctOption: 1,
    explanation: "IP addresses and routing operate at Layer 3 (Network Layer)."
  },
  {
    questionId: "MCQ-NET-042",
    questionText: "What is the three-way handshake sequence used to establish a TCP connection?",
    category: "Computer Networks",
    difficulty: "EASY",
    options: ["ACK, SYN, SYN-ACK", "SYN, SYN-ACK, ACK", "CONNECT, ACCEPT, CONFIRM", "FIN, FIN-ACK, ACK"],
    correctOption: 1,
    explanation: "TCP connection setup follows: SYN -> SYN-ACK -> ACK."
  },
  {
    questionId: "MCQ-NET-043",
    questionText: "What is the default port number for secure HTTP (HTTPS) communication?",
    category: "Computer Networks",
    difficulty: "EASY",
    options: ["80", "8080", "443", "22"],
    correctOption: 2,
    explanation: "Port 443 is standard for TLS/SSL encrypted HTTPS traffic."
  },
  {
    questionId: "MCQ-NET-044",
    questionText: "What is the maximum number of usable host IP addresses in a `/24` IPv4 subnet?",
    category: "Computer Networks",
    difficulty: "MEDIUM",
    options: ["256", "254", "255", "128"],
    correctOption: 1,
    explanation: "256 total IPs minus 2 (Network ID and Broadcast address) = 254 usable hosts."
  },
  {
    questionId: "MCQ-NET-045",
    questionText: "Which protocol resolves an IP address to its corresponding physical MAC address on a local network?",
    category: "Computer Networks",
    difficulty: "EASY",
    options: ["DNS", "DHCP", "ARP", "ICMP"],
    correctOption: 2,
    explanation: "Address Resolution Protocol (ARP) translates IPv4 addresses to MAC addresses."
  },
  {
    questionId: "MCQ-NET-046",
    questionText: "What key advantage does UDP have over TCP?",
    category: "Computer Networks",
    difficulty: "EASY",
    options: [
      "Guaranteed ordered delivery",
      "Automatic retransmission of lost packets",
      "Lower latency and overhead due to connectionless operation",
      "Built-in data encryption"
    ],
    correctOption: 2,
    explanation: "UDP is connectionless and lightweight, ideal for real-time gaming and streaming."
  },
  {
    questionId: "MCQ-NET-047",
    questionText: "What is the purpose of the TTL (Time to Live) field in an IPv4 packet header?",
    category: "Computer Networks",
    difficulty: "MEDIUM",
    options: [
      "To record total packet transmission speed",
      "To prevent packets from circulating indefinitely in routing loops",
      "To encrypt packet payload",
      "To assign packet priority"
    ],
    correctOption: 1,
    explanation: "TTL decrements at each router hop; packet is discarded when TTL reaches 0."
  },
  {
    questionId: "MCQ-NET-048",
    questionText: "Which HTTP request method is idempotent and used to completely replace a target resource?",
    category: "Computer Networks",
    difficulty: "MEDIUM",
    options: ["POST", "PUT", "PATCH", "CONNECT"],
    correctOption: 1,
    explanation: "PUT replaces target resource representation idempotently."
  },
  {
    questionId: "MCQ-NET-049",
    questionText: "What does DNS (Domain Name System) translate?",
    category: "Computer Networks",
    difficulty: "EASY",
    options: [
      "MAC addresses to IP addresses",
      "Human-readable domain names (e.g. google.com) to numeric IP addresses",
      "HTTP headers to HTML code",
      "Binary bits to ASCII text"
    ],
    correctOption: 1,
    explanation: "DNS acts as the phonebook of the internet translating domain names to IP addresses."
  },
  {
    questionId: "MCQ-NET-050",
    questionText: "In network security, what is the primary role of NAT (Network Address Translation)?",
    category: "Computer Networks",
    difficulty: "MEDIUM",
    options: [
      "To accelerate fiber optic speeds",
      "To map multiple private internal IP addresses to a single public IP address",
      "To block virus downloads",
      "To encrypt local Wi-Fi signals"
    ],
    correctOption: 1,
    explanation: "NAT enables multiple devices on a LAN to share a single public IPv4 address."
  },

  // --- DOMAIN 6: OBJECT-ORIENTED & SOFTWARE DESIGN (10 Questions) ---
  {
    questionId: "MCQ-OOP-051",
    questionText: "Which OOP principle hides internal state and requires all interaction to occur through public methods?",
    category: "OOP & Software Design",
    difficulty: "EASY",
    options: ["Polymorphism", "Abstraction", "Encapsulation", "Inheritance"],
    correctOption: 2,
    explanation: "Encapsulation bundles data with methods and restricts direct access to internal fields."
  },
  {
    questionId: "MCQ-OOP-052",
    questionText: "What does the 'L' in SOLID design principles stand for?",
    category: "OOP & Software Design",
    difficulty: "MEDIUM",
    options: ["Linear Dependency Principle", "Liskov Substitution Principle", "Logical Isolation Principle", "Lazy Initialization Principle"],
    correctOption: 1,
    explanation: "Liskov Substitution Principle dictates objects of a superclass should be replaceable with objects of subclasses."
  },
  {
    questionId: "MCQ-OOP-053",
    questionText: "Which Design Pattern ensures that a class has only one instance while providing a global point of access?",
    category: "OOP & Software Design",
    difficulty: "EASY",
    options: ["Factory Pattern", "Observer Pattern", "Singleton Pattern", "Strategy Pattern"],
    correctOption: 2,
    explanation: "Singleton pattern restricts instantiation to a single object instance."
  },
  {
    questionId: "MCQ-OOP-054",
    questionText: "What is Method Overloading in Object-Oriented Programming?",
    category: "OOP & Software Design",
    difficulty: "EASY",
    options: [
      "Defining a method in a child class with identical signature as superclass",
      "Defining multiple methods in the same class with the same name but different parameter lists",
      "Deleting a method at runtime",
      "Calling a private method from an outside package"
    ],
    correctOption: 1,
    explanation: "Overloading allows methods in the same scope to share a name with varying parameter signatures."
  },
  {
    questionId: "MCQ-OOP-055",
    questionText: "What design pattern defines a one-to-many dependency so that when one object changes state, all its dependents are notified automatically?",
    category: "OOP & Software Design",
    difficulty: "MEDIUM",
    options: ["Observer Pattern", "Decorator Pattern", "Adapter Pattern", "Proxy Pattern"],
    correctOption: 0,
    explanation: "The Observer pattern is key to event-driven architectures and reactive UI updates."
  },
  {
    questionId: "MCQ-OOP-056",
    questionText: "What is an Abstract Class?",
    category: "OOP & Software Design",
    difficulty: "MEDIUM",
    options: [
      "A class that cannot contain methods",
      "A class that cannot be instantiated directly and serves as a base blueprint for subclasses",
      "A final class that prohibits inheritance",
      "A class stored in binary format"
    ],
    correctOption: 1,
    explanation: "Abstract classes cannot be instantiated with `new` and often contain abstract method stubs."
  },
  {
    questionId: "MCQ-OOP-057",
    questionText: "Which OOP concept allows a child class to provide a specific implementation of a method already defined in its parent class?",
    category: "OOP & Software Design",
    difficulty: "EASY",
    options: ["Method Overloading", "Method Overriding", "Data Hiding", "Static Binding"],
    correctOption: 1,
    explanation: "Method Overriding implements runtime dynamic polymorphism by redefining superclass behavior."
  },
  {
    questionId: "MCQ-OOP-058",
    questionText: "What is Composition over Inheritance principle in software design?",
    category: "OOP & Software Design",
    difficulty: "MEDIUM",
    options: [
      "Prefer deep class hierarchies over interfaces",
      "Prefer combining simple objects ('has-a') over rigid subclassing ('is-a')",
      "Avoid using constructors",
      "Always write code in C rather than C++"
    ],
    correctOption: 1,
    explanation: "Composition provides greater flexibility and looser coupling than tight inheritance chains."
  },
  {
    questionId: "MCQ-OOP-059",
    questionText: "Which UML diagram models the dynamic sequence of messages exchanged between objects over time?",
    category: "OOP & Software Design",
    difficulty: "EASY",
    options: ["Class Diagram", "Sequence Diagram", "Use Case Diagram", "Deployment Diagram"],
    correctOption: 1,
    explanation: "Sequence diagrams chronologically chart object interactions and message exchanges."
  },
  {
    questionId: "MCQ-OOP-060",
    questionText: "What is the purpose of the Factory Method Design Pattern?",
    category: "OOP & Software Design",
    difficulty: "MEDIUM",
    options: [
      "To destroy unused garbage objects",
      "To delegate object instantiation to subclasses without specifying exact concrete classes",
      "To serialize objects to JSON",
      "To protect fields from multithreaded access"
    ],
    correctOption: 1,
    explanation: "Factory Method abstracts concrete creation logic behind an interface or creator method."
  },

  // --- DOMAIN 7: PYTHON, C & JAVASCRIPT CONCEPTS (10 Questions) ---
  {
    questionId: "MCQ-LANG-061",
    questionText: "In Python, what is the output of `list(set([1, 2, 2, 3, 1]))`?",
    category: "Programming Languages",
    difficulty: "EASY",
    options: ["[1, 2, 2, 3, 1]", "[1, 2, 3]", "[3, 2, 1]", "TypeError"],
    correctOption: 1,
    explanation: "Sets store unique elements only, removing duplicate 1 and 2."
  },
  {
    questionId: "MCQ-LANG-062",
    questionText: "In C programming, what will happen if you access an array out of its declared bounds?",
    category: "Programming Languages",
    difficulty: "EASY",
    options: ["Compile-time error", "Undefined Behavior (may crash or return garbage)", "IndexOutOfBoundsException", "Array automatically resizes"],
    correctOption: 1,
    explanation: "C performs no bounds checking; out-of-bounds access is Undefined Behavior."
  },
  {
    questionId: "MCQ-LANG-063",
    questionText: "What does the `pass` keyword do in Python?",
    category: "Programming Languages",
    difficulty: "EASY",
    options: [
      "Exits the current function immediately",
      "Null statement that acts as a placeholder where code is syntactically required",
      "Skips to next iteration of a loop",
      "Imports global variables"
    ],
    correctOption: 1,
    explanation: "`pass` is a no-operation statement used when syntactically a block is required."
  },
  {
    questionId: "MCQ-LANG-064",
    questionText: "In C, what is a 'Dangling Pointer'?",
    category: "Programming Languages",
    difficulty: "MEDIUM",
    options: [
      "A pointer initialized to NULL",
      "A pointer referencing a memory location that has been deallocated or freed",
      "A pointer pointing to another pointer",
      "A void pointer"
    ],
    correctOption: 1,
    explanation: "Dangling pointers point to invalid or freed memory locations."
  },
  {
    questionId: "MCQ-LANG-065",
    questionText: "What is Python's Global Interpreter Lock (GIL)?",
    category: "Programming Languages",
    difficulty: "MEDIUM",
    options: [
      "A security firewall preventing file access",
      "A mutex that allows only one native thread to execute Python bytecode at a time in CPython",
      "A compiler optimizer for loops",
      "A memory allocator for lists"
    ],
    correctOption: 1,
    explanation: "GIL prevents multi-core CPU parallelism for CPU-bound threads in standard CPython."
  },
  {
    questionId: "MCQ-LANG-066",
    questionText: "In JavaScript, what is the concept of 'Hoisting'?",
    category: "Programming Languages",
    difficulty: "MEDIUM",
    options: [
      "Moving DOM elements to top of page",
      "Variable and function declarations being moved to top of their scope during compilation",
      "Converting strings to numbers automatically",
      "Pushing objects onto heap memory"
    ],
    correctOption: 1,
    explanation: "JS engine hoists function and var declarations to top of scope prior to execution."
  },
  {
    questionId: "MCQ-LANG-067",
    questionText: "What is the return type of `malloc()` function in C?",
    category: "Programming Languages",
    difficulty: "EASY",
    options: ["int*", "char*", "void*", "size_t"],
    correctOption: 2,
    explanation: "malloc() returns a void* generic pointer pointing to allocated memory."
  },
  {
    questionId: "MCQ-LANG-068",
    questionText: "In Python, what does the decorator `@staticmethod` indicate?",
    category: "Programming Languages",
    difficulty: "MEDIUM",
    options: [
      "Method receives implicit first argument `self`",
      "Method receives implicit first argument `cls`",
      "Method does not receive implicit `self` or `cls` reference",
      "Method cannot be called outside class"
    ],
    correctOption: 2,
    explanation: "Static methods belong to class namespace without bound instance or class parameters."
  },
  {
    questionId: "MCQ-LANG-069",
    questionText: "What will `console.log([] + [])` produce in JavaScript?",
    category: "Programming Languages",
    difficulty: "MEDIUM",
    options: ["[]", "0", "Empty string `\"\"`", "NaN"],
    correctOption: 2,
    explanation: "Both arrays are converted to primitive empty strings `\"\" + \"\" = \"\"`."
  },
  {
    questionId: "MCQ-LANG-070",
    questionText: "In C, what is the size of `char` data type defined by ANSI C standard?",
    category: "Programming Languages",
    difficulty: "EASY",
    options: ["1 byte (8 bits)", "2 bytes", "4 bytes", "Depends on OS architecture"],
    correctOption: 0,
    explanation: "sizeof(char) is guaranteed by C standard to be exactly 1 byte."
  },

  // --- DOMAIN 8: CYBERSECURITY & CRYPTOGRAPHY (10 Questions) ---
  {
    questionId: "MCQ-SEC-071",
    questionText: "What is the key difference between Symmetric and Asymmetric encryption?",
    category: "Cybersecurity & Crypto",
    difficulty: "EASY",
    options: [
      "Symmetric uses numbers, Asymmetric uses letters",
      "Symmetric uses one shared secret key; Asymmetric uses a public-private key pair",
      "Symmetric runs on server, Asymmetric on client",
      "Symmetric cannot encrypt text files"
    ],
    correctOption: 1,
    explanation: "Symmetric uses identical key for encrypt/decrypt; Asymmetric uses paired keys."
  },
  {
    questionId: "MCQ-SEC-072",
    questionText: "How does a SQL Injection attack exploit vulnerable web applications?",
    category: "Cybersecurity & Crypto",
    difficulty: "EASY",
    options: [
      "By flooding server port 80 with SYN packets",
      "By injecting malicious SQL code into input parameters to manipulate database queries",
      "By stealing SSL certificates",
      "By guessing user passwords via dictionary brute-force"
    ],
    correctOption: 1,
    explanation: "Unsanitized user inputs concatenated into raw SQL strings allow arbitrary query execution."
  },
  {
    questionId: "MCQ-SEC-073",
    questionText: "What property distinguishes cryptographic hashing algorithms (like SHA-256) from encryption algorithms?",
    category: "Cybersecurity & Crypto",
    difficulty: "EASY",
    options: [
      "Hashing is reversible with a secret key",
      "Hashing is a one-way deterministic mathematical function that cannot be decrypted",
      "Hashing is only used for images",
      "Hashing generates variable output length"
    ],
    correctOption: 1,
    explanation: "Hashes are one-way functions; you cannot reverse a SHA-256 digest back to original plaintext."
  },
  {
    questionId: "MCQ-SEC-074",
    questionText: "What is Salting in password storage security?",
    category: "Cybersecurity & Crypto",
    difficulty: "MEDIUM",
    options: [
      "Encrypting passwords twice with AES",
      "Appending a random unique string to passwords before hashing to mitigate Rainbow Table attacks",
      "Truncating passwords to 8 characters",
      "Storing passwords in browser cookies"
    ],
    correctOption: 1,
    explanation: "Salting ensures identical passwords yield completely distinct hash digests."
  },
  {
    questionId: "MCQ-SEC-075",
    questionText: "Which type of attack involves an attacker placing themselves between two communicating parties to eavesdrop or alter data?",
    category: "Cybersecurity & Crypto",
    difficulty: "EASY",
    options: ["Man-in-the-Middle (MitM) Attack", "Buffer Overflow Attack", "Zero-Day Exploit", "Denial of Service (DoS)"],
    correctOption: 0,
    explanation: "MitM intercepts network communications between client and server."
  },
  {
    questionId: "MCQ-SEC-076",
    questionText: "What vulnerability allows attackers to execute malicious scripts in victim's browser via trusted websites?",
    category: "Cybersecurity & Crypto",
    difficulty: "EASY",
    options: ["CSRF", "Cross-Site Scripting (XSS)", "Directory Traversal", "Server-Side Request Forgery"],
    correctOption: 1,
    explanation: "XSS injects client-side executable scripts into web applications."
  },
  {
    questionId: "MCQ-SEC-077",
    questionText: "What is a 'Zero-Day' vulnerability?",
    category: "Cybersecurity & Crypto",
    difficulty: "EASY",
    options: ["A bug that takes 0 days to fix", "A security flaw discovered that has no existing patch or fix from vendor", "A virus created on January 1st", "A weak password policy"],
    correctOption: 1,
    explanation: "Zero-Day refers to flaws unknown to vendor with 0 days of patch availability."
  },
  {
    questionId: "MCQ-SEC-078",
    questionText: "In public key infrastructure (PKI), what is the role of a Certificate Authority (CA)?",
    category: "Cybersecurity & Crypto",
    difficulty: "MEDIUM",
    options: [
      "To host database backups",
      "To digitally sign and verify authenticity of public key digital certificates",
      "To block IP addresses",
      "To generate domain names"
    ],
    correctOption: 1,
    explanation: "CA issues digital certificates verifying ownership of public keys."
  },
  {
    questionId: "MCQ-SEC-079",
    questionText: "Which security principle asserts that users should only be granted minimum access permissions necessary to perform their job?",
    category: "Cybersecurity & Crypto",
    difficulty: "EASY",
    options: ["Principle of Least Privilege", "Defense in Depth", "Single Sign-On", "Zero Trust Isolation"],
    correctOption: 0,
    explanation: "Least Privilege minimizes attack surfaces by restricting user entitlements."
  },
  {
    questionId: "MCQ-SEC-080",
    questionText: "What is the function of a Web Application Firewall (WAF)?",
    category: "Cybersecurity & Crypto",
    difficulty: "MEDIUM",
    options: [
      "To compress JPEG image assets",
      "To monitor, filter, and block HTTP/HTTPS traffic to and from web applications",
      "To increase RAM capacity of web servers",
      "To format HTML tags"
    ],
    correctOption: 1,
    explanation: "WAF protects web services against attacks like SQLi, XSS, and bad bots."
  },

  // --- DOMAIN 9: CLOUD, AI & MODERN TECH (10 Questions) ---
  {
    questionId: "MCQ-CLOUD-081",
    questionText: "What is the primary architectural difference between Docker Containers and Virtual Machines (VMs)?",
    category: "Cloud & Modern Tech",
    difficulty: "MEDIUM",
    options: [
      "Containers require hardware hypervisors, VMs do not",
      "Containers share host OS kernel, VMs virtualize entire guest OS hardware stack",
      "Containers run only on Linux, VMs only on Windows",
      "VMs deploy in seconds, containers take hours"
    ],
    correctOption: 1,
    explanation: "Containers share host kernel making them lightweight compared to full guest OS VMs."
  },
  {
    questionId: "MCQ-CLOUD-082",
    questionText: "In Machine Learning, what is 'Overfitting'?",
    category: "Cloud & Modern Tech",
    difficulty: "EASY",
    options: [
      "Model performs poorly on both training and test data",
      "Model learns training data noise too well and fails to generalize to unseen test data",
      "Model trains too fast",
      "Dataset has missing columns"
    ],
    correctOption: 1,
    explanation: "Overfitting exhibits high training accuracy but poor test/validation performance."
  },
  {
    questionId: "MCQ-CLOUD-083",
    questionText: "What does Serverless Computing (e.g., AWS Lambda) mean for developers?",
    category: "Cloud & Modern Tech",
    difficulty: "EASY",
    options: [
      "No physical servers exist anywhere on Earth",
      "Cloud provider automatically manages server provisioning, scaling, and maintenance while developer writes code only",
      "Code runs without internet connectivity",
      "Servers run for free without cost"
    ],
    correctOption: 1,
    explanation: "Serverless abstracts infrastructure management so code executes on-demand."
  },
  {
    questionId: "MCQ-CLOUD-084",
    questionText: "What is GraphQL's main advantage over traditional REST APIs?",
    category: "Cloud & Modern Tech",
    difficulty: "MEDIUM",
    options: [
      "GraphQL does not use HTTP",
      "Clients can request exact data fields required, avoiding over-fetching and under-fetching",
      "GraphQL eliminates database indexes",
      "GraphQL is strictly for C++ applications"
    ],
    correctOption: 1,
    explanation: "GraphQL allows precise query specifications for client data fetching."
  },
  {
    questionId: "MCQ-CLOUD-085",
    questionText: "In Neural Networks, what is the function of an Activation Function (like ReLU or Sigmoid)?",
    category: "Cloud & Modern Tech",
    difficulty: "MEDIUM",
    options: [
      "To store weight matrices in disk",
      "To introduce non-linearity into network enabling learning of complex patterns",
      "To normalize dataset labels",
      "To prevent GPU heating"
    ],
    correctOption: 1,
    explanation: "Non-linear activation functions enable neural nets to approximate non-linear functions."
  },
  {
    questionId: "MCQ-CLOUD-086",
    questionText: "What is CI/CD in modern DevOps practices?",
    category: "Cloud & Modern Tech",
    difficulty: "EASY",
    options: [
      "Computer Interface / Central Device",
      "Continuous Integration / Continuous Deployment (automated building, testing, and shipping)",
      "Code Inspection / Code Deletion",
      "Cloud Isolation / Cloud Defense"
    ],
    correctOption: 1,
    explanation: "CI/CD automates code testing and deployment pipelines."
  },
  {
    questionId: "MCQ-CLOUD-087",
    questionText: "Which Cloud service model provides virtualized computing infrastructure (servers, storage, networking) as a service?",
    category: "Cloud & Modern Tech",
    difficulty: "EASY",
    options: ["SaaS (Software as a Service)", "PaaS (Platform as a Service)", "IaaS (Infrastructure as a Service)", "FaaS (Function as a Service)"],
    correctOption: 2,
    explanation: "IaaS (e.g. AWS EC2) delivers raw virtual infrastructure resources."
  },
  {
    questionId: "MCQ-CLOUD-088",
    questionText: "In AI, what is a Large Language Model (LLM) Transformer architecture based on?",
    category: "Cloud & Modern Tech",
    difficulty: "MEDIUM",
    options: ["Recurrent Convolution", "Self-Attention Mechanism", "Decision Trees", "Genetic Mutation"],
    correctOption: 1,
    explanation: "Transformers rely on self-attention mechanisms to weigh token relationships in parallel."
  },
  {
    questionId: "MCQ-CLOUD-089",
    questionText: "What is Kubernetes used for in cloud infrastructure?",
    category: "Cloud & Modern Tech",
    difficulty: "EASY",
    options: [
      "Writing SQL queries",
      "Orchestrating, scaling, and managing containerized applications across clusters",
      "Editing video streams",
      "Designing UI mockups"
    ],
    correctOption: 1,
    explanation: "Kubernetes automates container deployment, scaling, and health monitoring."
  },
  {
    questionId: "MCQ-CLOUD-090",
    questionText: "What is the primary goal of Supervised Machine Learning?",
    category: "Cloud & Modern Tech",
    difficulty: "EASY",
    options: [
      "Clustering unlabeled data points",
      "Training a model using input data paired with correct ground-truth labels",
      "Executing random actions in an environment",
      "Compiling source code"
    ],
    correctOption: 1,
    explanation: "Supervised learning uses labeled pairs (X, Y) to train predictive mappings."
  },

  // --- DOMAIN 10: LOGIC & BITWISE OPERATIONS (10 Questions) ---
  {
    questionId: "MCQ-BIT-091",
    questionText: "What will `5 ^ 5` evaluate to in bitwise XOR operation?",
    category: "Boolean Logic & Bitwise",
    difficulty: "EASY",
    options: ["10", "25", "0", "5"],
    correctOption: 2,
    explanation: "XORing any number with itself produces 0 (`x ^ x = 0`)."
  },
  {
    questionId: "MCQ-BIT-092",
    questionText: "What is the bitwise left shift operation `5 << 1` equal to in decimal?",
    category: "Boolean Logic & Bitwise",
    difficulty: "EASY",
    options: ["2", "5", "10", "25"],
    correctOption: 2,
    explanation: "Bitwise left shift by 1 multiplies the integer by 2 (`5 * 2 = 10`)."
  },
  {
    questionId: "MCQ-BIT-093",
    questionText: "How do you check if an integer `N` is a power of 2 using bitwise operations?",
    category: "Boolean Logic & Bitwise",
    difficulty: "MEDIUM",
    options: ["(N & (N - 1)) == 0", "(N | (N - 1)) == 0", "(N ^ (N + 1)) == 0", "(N >> 1) == 0"],
    correctOption: 0,
    explanation: "Powers of 2 have a single 1 bit. `N & (N - 1)` clears that single bit to 0."
  },
  {
    questionId: "MCQ-BIT-094",
    questionText: "What is De Morgan's Law equivalent for `NOT (A AND B)`?",
    category: "Boolean Logic & Bitwise",
    difficulty: "EASY",
    options: ["(NOT A) AND (NOT B)", "(NOT A) OR (NOT B)", "A OR B", "A XOR B"],
    correctOption: 1,
    explanation: "`!(A && B)` is equivalent to `!A || !B` according to De Morgan's Law."
  },
  {
    questionId: "MCQ-BIT-095",
    questionText: "What representation is standard in modern hardware for storing signed negative integers?",
    category: "Boolean Logic & Bitwise",
    difficulty: "EASY",
    options: ["Sign-Magnitude", "One's Complement", "Two's Complement", "Excess-64"],
    correctOption: 2,
    explanation: "Two's complement allows simple unified binary addition for both positive and negative values."
  },
  {
    questionId: "MCQ-BIT-096",
    questionText: "What is `x & 1` used for in C/C++/Python?",
    category: "Boolean Logic & Bitwise",
    difficulty: "EASY",
    options: [
      "To check if `x` is even",
      "To check if `x` is odd (returns 1 if odd, 0 if even)",
      "To double `x`",
      "To negate `x`"
    ],
    correctOption: 1,
    explanation: "The least significant bit of an integer is 1 if odd and 0 if even."
  },
  {
    questionId: "MCQ-BIT-097",
    questionText: "What is the truth table output of an XOR gate when both inputs are 1?",
    category: "Boolean Logic & Bitwise",
    difficulty: "EASY",
    options: ["1", "0", "High Z", "Undefined"],
    correctOption: 1,
    explanation: "XOR outputs 1 if and only if inputs differ. For (1, 1), output is 0."
  },
  {
    questionId: "MCQ-BIT-098",
    questionText: "What will `~0` (bitwise NOT of 0) produce in 32-bit signed Two's Complement?",
    category: "Boolean Logic & Bitwise",
    difficulty: "MEDIUM",
    options: ["0", "1", "-1", "2147483647"],
    correctOption: 2,
    explanation: "Inverting all 0 bits gives all 1 bits, which represents -1 in Two's complement."
  },
  {
    questionId: "MCQ-BIT-099",
    questionText: "How can you swap two integers `a` and `b` without using a temporary variable?",
    category: "Boolean Logic & Bitwise",
    difficulty: "MEDIUM",
    options: [
      "a = a + b; b = a - b; a = a - b;",
      "a = a ^ b; b = a ^ b; a = a ^ b;",
      "Both option A and option B are valid",
      "None of the above"
    ],
    correctOption: 2,
    explanation: "Both arithmetic sum-difference and XOR swap algorithms exchange values without temp storage."
  },
  {
    questionId: "MCQ-BIT-100",
    questionText: "What logic gate is known as a 'Universal Gate' capable of implementing any boolean function?",
    category: "Boolean Logic & Bitwise",
    difficulty: "EASY",
    options: ["AND Gate", "OR Gate", "NAND Gate", "XOR Gate"],
    correctOption: 2,
    explanation: "NAND (and NOR) gates are universal logic gates."
  }
];

// --- BANK 2: 50 DEBUGGING PROBLEMS (Round 2) ---
// (15 C, 15 Python, 15 Java, 5 Bonus/Practice problems across C++, JS)
export const seedDebugProblems = [
  // C PROGRAM DEBUGGING (15 Problems)
  {
    problemId: 1,
    title: "C Pointer Null Dereference in String Copy",
    description: "Identify and fix the segmentation fault bug in this C program that copies strings.",
    language: "C",
    difficulty: "EASY",
    brokenCode: `#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char *str;\n    strcpy(str, "TECHNOVA 2026"); // BUG: Uninitialized pointer\n    printf("%s\\n", str);\n    return 0;\n}`,
    expectedOutput: "TECHNOVA 2026",
    solutionSnippet: `#include <stdio.h>\n#include <string.h>\n#include <stdlib.h>\n\nint main() {\n    char str[50];\n    strcpy(str, "TECHNOVA 2026");\n    printf("%s\\n", str);\n    return 0;\n}`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 2,
    title: "C Array Out-of-Bounds Off-By-One Bug",
    description: "Fix the loop condition that causes array buffer overflow memory corruption in C.",
    language: "C",
    difficulty: "MEDIUM",
    brokenCode: `#include <stdio.h>\n\nint main() {\n    int arr[5] = {10, 20, 30, 40, 50};\n    int sum = 0;\n    for (int i = 0; i <= 5; i++) { // BUG: i <= 5 causes out-of-bounds\n        sum += arr[i];\n    }\n    printf("Sum: %d\\n", sum);\n    return 0;\n}`,
    expectedOutput: "Sum: 150",
    solutionSnippet: `#include <stdio.h>\n\nint main() {\n    int arr[5] = {10, 20, 30, 40, 50};\n    int sum = 0;\n    for (int i = 0; i < 5; i++) {\n        sum += arr[i];\n    }\n    printf("Sum: %d\\n", sum);\n    return 0;\n}`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 3,
    title: "C Integer Division Truncation Error",
    description: "Fix the data type issue causing percentage calculations to result in 0.",
    language: "C",
    difficulty: "EASY",
    brokenCode: `#include <stdio.h>\n\nint main() {\n    int obtained = 85;\n    int total = 100;\n    float percentage = (obtained / total) * 100; // BUG: 85/100 integer division = 0\n    printf("Percentage: %.2f\\n", percentage);\n    return 0;\n}`,
    expectedOutput: "Percentage: 85.00",
    solutionSnippet: `#include <stdio.h>\n\nint main() {\n    int obtained = 85;\n    int total = 100;\n    float percentage = ((float)obtained / total) * 100;\n    printf("Percentage: %.2f\\n", percentage);\n    return 0;\n}`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 4,
    title: "C Memory Leak with Malloc Free Missing",
    description: "Ensure dynamic memory is safely allocated and deallocated in C.",
    language: "C",
    difficulty: "MEDIUM",
    brokenCode: `#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int *ptr = (int*)malloc(5 * sizeof(int));\n    for(int i=0; i<5; i++) ptr[i] = (i+1)*10;\n    printf("First: %d, Last: %d\\n", ptr[0], ptr[4]);\n    // BUG: Missing free(ptr);\n    return 0;\n}`,
    expectedOutput: "First: 10, Last: 50",
    solutionSnippet: `#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int *ptr = (int*)malloc(5 * sizeof(int));\n    for(int i=0; i<5; i++) ptr[i] = (i+1)*10;\n    printf("First: %d, Last: %d\\n", ptr[0], ptr[4]);\n    free(ptr);\n    return 0;\n}`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 5,
    title: "C String Comparison Pointer Equality Bug",
    description: "Fix string equality comparison in C to properly inspect contents.",
    language: "C",
    difficulty: "EASY",
    brokenCode: `#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char pass[10] = "ADMIN";\n    if (pass == "ADMIN") { // BUG: Compares memory addresses, not strings!\n        printf("Access Granted\\n");\n    } else {\n        printf("Access Denied\\n");\n    }\n    return 0;\n}`,
    expectedOutput: "Access Granted",
    solutionSnippet: `#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char pass[10] = "ADMIN";\n    if (strcmp(pass, "ADMIN") == 0) {\n        printf("Access Granted\\n");\n    } else {\n        printf("Access Denied\\n");\n    }\n    return 0;\n}`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 6,
    title: "C Infinite Recursion Stack Overflow",
    description: "Fix missing base condition in recursive factorial function.",
    language: "C",
    difficulty: "MEDIUM",
    brokenCode: `#include <stdio.h>\n\nint factorial(int n) {\n    return n * factorial(n - 1); // BUG: Missing base condition n <= 1\n}\n\nint main() {\n    printf("Fact 5: %d\\n", factorial(5));\n    return 0;\n}`,
    expectedOutput: "Fact 5: 120",
    solutionSnippet: `#include <stdio.h>\n\nint factorial(int n) {\n    if (n <= 1) return 1;\n    return n * factorial(n - 1);\n}\n\nint main() {\n    printf("Fact 5: %d\\n", factorial(5));\n    return 0;\n}`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 7,
    title: "C Format Specifier Type Mismatch",
    description: "Fix printf specifier mismatch for long long integers in C.",
    language: "C",
    difficulty: "EASY",
    brokenCode: `#include <stdio.h>\n\nint main() {\n    long long bigNum = 9876543210LL;\n    printf("Big Number: %d\\n", bigNum); // BUG: %d truncates 64-bit integer\n    return 0;\n}`,
    expectedOutput: "Big Number: 9876543210",
    solutionSnippet: `#include <stdio.h>\n\nint main() {\n    long long bigNum = 9876543210LL;\n    printf("Big Number: %lld\\n", bigNum);\n    return 0;\n}`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 8,
    title: "C Pass-By-Value Swap Failure",
    description: "Fix function parameters so swap changes variables in calling function.",
    language: "C",
    difficulty: "EASY",
    brokenCode: `#include <stdio.h>\n\nvoid swap(int a, int b) { // BUG: Pass by value doesn't affect main variables\n    int temp = a;\n    a = b;\n    b = temp;\n}\n\nint main() {\n    int x = 5, y = 10;\n    swap(x, y);\n    printf("x=%d, y=%d\\n", x, y);\n    return 0;\n}`,
    expectedOutput: "x=10, y=5",
    solutionSnippet: `#include <stdio.h>\n\nvoid swap(int *a, int *b) {\n    int temp = *a;\n    *a = *b;\n    *b = temp;\n}\n\nint main() {\n    int x = 5, y = 10;\n    swap(&x, &y);\n    printf("x=%d, y=%d\\n", x, y);\n    return 0;\n}`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 9,
    title: "C Uninitialized Variable Garbage Value Bug",
    description: "Fix accumulator variable initialization before summing numbers.",
    language: "C",
    difficulty: "EASY",
    brokenCode: `#include <stdio.h>\n\nint main() {\n    int total; // BUG: Uninitialized contains random stack garbage\n    for (int i=1; i<=3; i++) total += i;\n    printf("Total: %d\\n", total);\n    return 0;\n}`,
    expectedOutput: "Total: 6",
    solutionSnippet: `#include <stdio.h>\n\nint main() {\n    int total = 0;\n    for (int i=1; i<=3; i++) total += i;\n    printf("Total: %d\\n", total);\n    return 0;\n}`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 10,
    title: "C Struct Alignment & Sizeof Padding Bug",
    description: "Fix struct initialization and member assignments in C.",
    language: "C",
    difficulty: "MEDIUM",
    brokenCode: `#include <stdio.h>\n\nstruct Student {\n    int id;\n    char name[20];\n};\n\nint main() {\n    struct Student s1;\n    s1.id = 101;\n    s1.name = "Alex"; // BUG: Cannot assign array directly in C!\n    printf("ID: %d, Name: %s\\n", s1.id, s1.name);\n    return 0;\n}`,
    expectedOutput: "ID: 101, Name: Alex",
    solutionSnippet: `#include <stdio.h>\n#include <string.h>\n\nstruct Student {\n    int id;\n    char name[20];\n};\n\nint main() {\n    struct Student s1;\n    s1.id = 101;\n    strcpy(s1.name, "Alex");\n    printf("ID: %d, Name: %s\\n", s1.id, s1.name);\n    return 0;\n}`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 11,
    title: "C Const Pointer Mutation Compiler Error",
    description: "Fix invalid pointer modification through a pointer-to-const in C.",
    language: "C",
    difficulty: "MEDIUM",
    brokenCode: `#include <stdio.h>\n\nint main() {\n    int val = 42;\n    const int *ptr = &val;\n    *ptr = 100; // BUG: Cannot modify const target\n    printf("Val: %d\\n", val);\n    return 0;\n}`,
    expectedOutput: "Val: 100",
    solutionSnippet: `#include <stdio.h>\n\nint main() {\n    int val = 42;\n    int *ptr = &val;\n    *ptr = 100;\n    printf("Val: %d\\n", val);\n    return 0;\n}`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 12,
    title: "C Switch Case Missing Break Fallthrough Bug",
    description: "Fix missing break statements causing unintended fallthrough in C switch statement.",
    language: "C",
    difficulty: "EASY",
    brokenCode: `#include <stdio.h>\n\nint main() {\n    int code = 1;\n    switch (code) {\n        case 1:\n            printf("ONE "); // BUG: Missing break causes fallthrough!\n        case 2:\n            printf("TWO ");\n            break;\n    }\n    printf("\\n");\n    return 0;\n}`,
    expectedOutput: "ONE ",
    solutionSnippet: `#include <stdio.h>\n\nint main() {\n    int code = 1;\n    switch (code) {\n        case 1:\n            printf("ONE ");\n            break;\n        case 2:\n            printf("TWO ");\n            break;\n    }\n    printf("\\n");\n    return 0;\n}`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 13,
    title: "C Macro Evaluation Operator Precedence Bug",
    description: "Fix macro expansion issue caused by missing parentheses.",
    language: "C",
    difficulty: "MEDIUM",
    brokenCode: `#include <stdio.h>\n\n#define SQUARE(x) x * x // BUG: Missing parentheses (a+1)*(a+1)\n\nint main() {\n    int res = SQUARE(2 + 3); // Evaluates as 2 + 3 * 2 + 3 = 11 instead of 25!\n    printf("Result: %d\\n", res);\n    return 0;\n}`,
    expectedOutput: "Result: 25",
    solutionSnippet: `#include <stdio.h>\n\n#define SQUARE(x) ((x) * (x))\n\nint main() {\n    int res = SQUARE(2 + 3);\n    printf("Result: %d\\n", res);\n    return 0;\n}`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 14,
    title: "C File Pointer Close Missing Memory Leak",
    description: "Ensure file handles are properly checked and closed in C file I/O.",
    language: "C",
    difficulty: "EASY",
    brokenCode: `#include <stdio.h>\n\nint main() {\n    FILE *fp = fopen("output.txt", "w");\n    if (fp) {\n        fputs("TechNova 2026", fp);\n        // BUG: Missing fclose(fp);\n    }\n    printf("File written successfully.\\n");\n    return 0;\n}`,
    expectedOutput: "File written successfully.",
    solutionSnippet: `#include <stdio.h>\n\nint main() {\n    FILE *fp = fopen("output.txt", "w");\n    if (fp) {\n        fputs("TechNova 2026", fp);\n        fclose(fp);\n    }\n    printf("File written successfully.\\n");\n    return 0;\n}`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 15,
    title: "C String Length Strlen Null Terminator Bug",
    description: "Fix buffer size allocation to account for string null terminator byte in C.",
    language: "C",
    difficulty: "MEDIUM",
    brokenCode: `#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\nint main() {\n    char src[] = "Hello";\n    char *dst = (char*)malloc(strlen(src)); // BUG: Forgotten +1 for null terminator '\\0'!\n    strcpy(dst, src);\n    printf("Dst: %s\\n", dst);\n    free(dst);\n    return 0;\n}`,
    expectedOutput: "Dst: Hello",
    solutionSnippet: `#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\nint main() {\n    char src[] = "Hello";\n    char *dst = (char*)malloc(strlen(src) + 1);\n    strcpy(dst, src);\n    printf("Dst: %s\\n", dst);\n    free(dst);\n    return 0;\n}`,
    marks: 10,
    status: "ACTIVE"
  },

  // PYTHON PROGRAM DEBUGGING (15 Problems)
  {
    problemId: 16,
    title: "Python Mutable Default Argument Bug",
    description: "Fix mutable default argument bug in Python function definitions.",
    language: "Python",
    difficulty: "EASY",
    brokenCode: `def add_item(item, items=[]): # BUG: Mutable list default retains state across calls!\n    items.append(item)\n    return items\n\nprint(add_item("A"))\nprint(add_item("B")) # Returns ['A', 'B'] unexpectedly`,
    expectedOutput: "['A']\n['B']",
    solutionSnippet: `def add_item(item, items=None):\n    if items is None:\n        items = []\n    items.append(item)\n    return items\n\nprint(add_item("A"))\nprint(add_item("B"))`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 17,
    title: "Python Dictionary Key Error Exception Handling",
    description: "Fix missing key access crash in Python dictionary lookup.",
    language: "Python",
    difficulty: "EASY",
    brokenCode: `student = {"id": "TN2026", "name": "Sarah"}\n# BUG: Accessing non-existent key causes KeyError crash\nscore = student["score"]\nprint(f"Score: {score}")`,
    expectedOutput: "Score: 0",
    solutionSnippet: `student = {"id": "TN2026", "name": "Sarah"}\nscore = student.get("score", 0)\nprint(f"Score: {score}")`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 18,
    title: "Python Variable Scope UnboundLocalError Bug",
    description: "Fix scope binding error when modifying a global variable inside a function.",
    language: "Python",
    difficulty: "MEDIUM",
    brokenCode: `counter = 10\n\ndef increment():\n    counter += 1 # BUG: UnboundLocalError because counter assigned locally without global keyword\n    print(counter)\n\nincrement()`,
    expectedOutput: "11",
    solutionSnippet: `counter = 10\n\ndef increment():\n    global counter\n    counter += 1\n    print(counter)\n\nincrement()`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 19,
    title: "Python Shallow Copy vs Deep Copy Mutation Bug",
    description: "Fix nested list mutation issue caused by shallow copying in Python.",
    language: "Python",
    difficulty: "MEDIUM",
    brokenCode: `original = [[1, 2], [3, 4]]\ncopy_list = original.copy() # BUG: Shallow copy shares inner list reference!\ncopy_list[0][0] = 99\nprint(f"Original[0][0]: {original[0][0]}")`,
    expectedOutput: "Original[0][0]: 1",
    solutionSnippet: `import copy\n\noriginal = [[1, 2], [3, 4]]\ncopy_list = copy.deepcopy(original)\ncopy_list[0][0] = 99\nprint(f"Original[0][0]: {original[0][0]}")`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 20,
    title: "Python String Concatenation TypeError Bug",
    description: "Fix implicit type error when concatenating integer with string in Python.",
    language: "Python",
    difficulty: "EASY",
    brokenCode: `age = 21\nmsg = "Participant Age: " + age # BUG: TypeError cannot concatenate str and int\nprint(msg)`,
    expectedOutput: "Participant Age: 21",
    solutionSnippet: `age = 21\nmsg = f"Participant Age: {age}"\nprint(msg)`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 21,
    title: "Python List Index Out of Range in Loop",
    description: "Fix index range boundary error in Python list iteration.",
    language: "Python",
    difficulty: "EASY",
    brokenCode: `nums = [10, 20, 30]\nfor i in range(len(nums) + 1): # BUG: +1 causes IndexError\n    print(nums[i])`,
    expectedOutput: "10\n20\n30",
    solutionSnippet: `nums = [10, 20, 30]\nfor num in nums:\n    print(num)`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 22,
    title: "Python Tuple Immutability Assignment Error",
    description: "Fix illegal item assignment on an immutable tuple in Python.",
    language: "Python",
    difficulty: "EASY",
    brokenCode: `point = (10, 20)\npoint[0] = 15 # BUG: TypeError tuple does not support item assignment\nprint(point)`,
    expectedOutput: "(15, 20)",
    solutionSnippet: `point = (10, 20)\npoint = (15, point[1])\nprint(point)`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 23,
    title: "Python IndentationError Code Block Bug",
    description: "Fix inconsistent mixing of tabs and spaces causing IndentationError.",
    language: "Python",
    difficulty: "EASY",
    brokenCode: `def check(x):\n    if x > 0:\n        print("Positive")\n      print("Done") # BUG: Incorrect indentation level`,
    expectedOutput: "Positive\nDone",
    solutionSnippet: `def check(x):\n    if x > 0:\n        print("Positive")
    print("Done")

check(5)`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 24,
    title: "Python Division By Zero Exception Bug",
    description: "Safely handle potential division by zero in average calculation.",
    language: "Python",
    difficulty: "EASY",
    brokenCode: `items = []\navg = sum(items) / len(items) # BUG: ZeroDivisionError when items is empty\nprint(avg)`,
    expectedOutput: "0.0",
    solutionSnippet: `items = []\navg = sum(items) / len(items) if items else 0.0\nprint(avg)`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 25,
    title: "Python Generator Expression Exhaustion Bug",
    description: "Fix reusing an exhausted Python generator without recreating it.",
    language: "Python",
    difficulty: "MEDIUM",
    brokenCode: `gen = (x * 2 for x in range(3))\nprint(list(gen))\nprint(list(gen)) # BUG: Generator is exhausted and returns empty list []`,
    expectedOutput: "[0, 2, 4]\n[0, 2, 4]",
    solutionSnippet: `nums = [x * 2 for x in range(3)]\nprint(nums)\nprint(nums)`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 26,
    title: "Python Lambda Closure Late Binding Bug",
    description: "Fix late binding variable scope in Python lambda list comprehensions.",
    language: "Python",
    difficulty: "MEDIUM",
    brokenCode: `funcs = [lambda: i for i in range(3)] # BUG: All lambdas reference final value i=2\nprint([f() for f in funcs])`,
    expectedOutput: "[0, 1, 2]",
    solutionSnippet: `funcs = [lambda x=i: x for i in range(3)]\nprint([f() for f in funcs])`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 27,
    title: "Python File Not Closed Resource Leak",
    description: "Convert manual file open/close into safe context manager `with` block.",
    language: "Python",
    difficulty: "EASY",
    brokenCode: `f = open("data.txt", "w")\nf.write("TECHNOVA")\n# BUG: File handle left unclosed\nprint("Data saved")`,
    expectedOutput: "Data saved",
    solutionSnippet: `with open("data.txt", "w") as f:\n    f.write("TECHNOVA")\nprint("Data saved")`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 28,
    title: "Python Modifying List While Iterating Bug",
    description: "Fix skipping elements when deleting items while iterating directly over list.",
    language: "Python",
    difficulty: "MEDIUM",
    brokenCode: `nums = [1, 2, 3, 4, 5]\nfor n in nums:\n    if n % 2 == 0:\n        nums.remove(n) # BUG: Modifying list shifts indices causing skipped elements\nprint(nums)`,
    expectedOutput: "[1, 3, 5]",
    solutionSnippet: `nums = [1, 2, 3, 4, 5]\nnums = [n for n in nums if n % 2 != 0]\nprint(nums)`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 29,
    title: "Python Keyword Arg Unpacking TypeError",
    description: "Fix missing keyword parameter in Python dictionary unpacking function call.",
    language: "Python",
    difficulty: "EASY",
    brokenCode: `def greet(name, role):\n    print(f"Hello {name}, Role: {role}")\n\ndata = {"name": "Alex", "role": "Admin", "extra": 123}\ngreet(**data) # BUG: TypeError unexpected keyword argument 'extra'`,
    expectedOutput: "Hello Alex, Role: Admin",
    solutionSnippet: `def greet(name, role, **kwargs):\n    print(f"Hello {name}, Role: {role}")\n\ndata = {"name": "Alex", "role": "Admin", "extra": 123}\ngreet(**data)`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 30,
    title: "Python Boolean Evaluation of Empty Objects",
    description: "Fix implicit boolean truthiness check on empty collections.",
    language: "Python",
    difficulty: "EASY",
    brokenCode: `val = []\nif val == True: # BUG: Empty list is falsy but does not equal literal True\n    print("Valid")\nelse:\n    print("Empty")`,
    expectedOutput: "Empty",
    solutionSnippet: `val = []\nif bool(val):\n    print("Valid")\nelse:\n    print("Empty")`,
    marks: 10,
    status: "ACTIVE"
  },

  // JAVA PROGRAM DEBUGGING (15 Problems)
  {
    problemId: 31,
    title: "Java NullPointerException in String Length",
    description: "Fix NullPointerException caused by calling methods on null object reference.",
    language: "Java",
    difficulty: "EASY",
    brokenCode: `public class Main {\n    public static void main(String[] args) {\n        String name = null;\n        System.out.println("Length: " + name.length()); // BUG: NullPointerException!\n    }\n}`,
    expectedOutput: "Length: 0",
    solutionSnippet: `public class Main {\n    public static void main(String[] args) {\n        String name = null;\n        System.out.println("Length: " + (name != null ? name.length() : 0));\n    }\n}`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 32,
    title: "Java String Equality Reference Bug",
    description: "Fix reference equality `==` bug when comparing Java String objects.",
    language: "Java",
    difficulty: "EASY",
    brokenCode: `public class Main {\n    public static void main(String[] args) {\n        String s1 = new String("TECHNOVA");\n        String s2 = new String("TECHNOVA");\n        if (s1 == s2) { // BUG: Compares object references, not character content!\n            System.out.println("MATCH");\n        } else {\n            System.out.println("MISMATCH");\n        }\n    }\n}`,
    expectedOutput: "MATCH",
    solutionSnippet: `public class Main {\n    public static void main(String[] args) {\n        String s1 = new String("TECHNOVA");\n        String s2 = new String("TECHNOVA");\n        if (s1.equals(s2)) {\n            System.out.println("MATCH");\n        } else {\n            System.out.println("MISMATCH");\n        }\n    }\n}`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 33,
    title: "Java Array Index Out Of Bounds Exception",
    description: "Fix array index boundary condition in Java array iteration.",
    language: "Java",
    difficulty: "EASY",
    brokenCode: `public class Main {\n    public static void main(String[] args) {\n        int[] arr = {1, 2, 3};\n        for (int i = 0; i <= arr.length; i++) { // BUG: ArrayIndexOutOfBoundsException\n            System.out.println(arr[i]);\n        }\n    }\n}`,
    expectedOutput: "1\n2\n3",
    solutionSnippet: `public class Main {\n    public static void main(String[] args) {\n        int[] arr = {1, 2, 3};\n        for (int i = 0; i < arr.length; i++) {\n            System.out.println(arr[i]);\n        }\n    }\n}`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 34,
    title: "Java Static Method Instance Access Compiler Error",
    description: "Fix static context error when calling instance method inside main.",
    language: "Java",
    difficulty: "EASY",
    brokenCode: `public class Main {\n    void printMsg() {\n        System.out.println("Hello Java");\n    }\n    public static void main(String[] args) {\n        printMsg(); // BUG: Cannot make static reference to non-static method\n    }\n}`,
    expectedOutput: "Hello Java",
    solutionSnippet: `public class Main {\n    static void printMsg() {\n        System.out.println("Hello Java");\n    }\n    public static void main(String[] args) {\n        printMsg();\n    }\n}`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 35,
    title: "Java ConcurrentModificationException Bug",
    description: "Fix removing items while iterating over Java ArrayList.",
    language: "Java",
    difficulty: "MEDIUM",
    brokenCode: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        List<String> list = new ArrayList<>(Arrays.asList("A", "B", "C"));\n        for (String s : list) {\n            if (s.equals("B")) list.remove(s); // BUG: ConcurrentModificationException\n        }\n        System.out.println(list);\n    }\n}`,
    expectedOutput: "[A, C]",
    solutionSnippet: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        List<String> list = new ArrayList<>(Arrays.asList("A", "B", "C"));\n        list.removeIf(s -> s.equals("B"));\n        System.out.println(list);\n    }\n}`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 36,
    title: "Java Integer Wrapper Cache Comparison Bug",
    description: "Fix Integer object reference comparison beyond cache boundary (-128 to 127).",
    language: "Java",
    difficulty: "MEDIUM",
    brokenCode: `public class Main {\n    public static void main(String[] args) {\n        Integer a = 200;\n        Integer b = 200;\n        if (a == b) { // BUG: Values > 127 create distinct Integer instances!\n            System.out.println("EQUAL");\n        } else {\n            System.out.println("DIFFERENT");\n        }\n    }\n}`,
    expectedOutput: "EQUAL",
    solutionSnippet: `public class Main {\n    public static void main(String[] args) {\n        Integer a = 200;\n        Integer b = 200;\n        if (a.equals(b)) {\n            System.out.println("EQUAL");\n        } else {\n            System.out.println("DIFFERENT");\n        }\n    }\n}`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 37,
    title: "Java Constructor Infinite Chaining Recursion",
    description: "Fix recursive constructor call causing StackOverflowError in Java.",
    language: "Java",
    difficulty: "MEDIUM",
    brokenCode: `public class Main {\n    public Main() {\n        this(0); // BUG: Recursively calls constructors infinitely!\n    }\n    public Main(int x) {\n        this();\n    }\n    public static void main(String[] args) {\n        Main m = new Main();\n    }\n}`,
    expectedOutput: "Initialized",
    solutionSnippet: `public class Main {\n    public Main() {\n        this(0);\n    }\n    public Main(int x) {\n        System.out.println("Initialized");\n    }\n    public static void main(String[] args) {\n        Main m = new Main();\n    }\n}`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 38,
    title: "Java Access Modifier Visibility Compiler Error",
    description: "Fix restricted access modifier in inherited interface method in Java.",
    language: "Java",
    difficulty: "EASY",
    brokenCode: `interface Printable {\n    void print();\n}\npublic class Main implements Printable {\n    void print() { // BUG: Cannot reduce visibility from public to package-private!\n        System.out.println("Print");\n    }\n    public static void main(String[] args) {\n        new Main().print();\n    }\n}`,
    expectedOutput: "Print",
    solutionSnippet: `interface Printable {\n    void print();\n}\npublic class Main implements Printable {\n    public void print() {\n        System.out.println("Print");\n    }\n    public static void main(String[] args) {\n        new Main().print();\n    }\n}`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 39,
    title: "Java Try-With-Resources Stream Leak",
    description: "Convert unclosed Scanner stream into auto-closeable try-with-resources.",
    language: "Java",
    difficulty: "EASY",
    brokenCode: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner("100");\n        int val = sc.nextInt();\n        // BUG: Scanner unclosed resource leak\n        System.out.println("Value: " + val);\n    }\n}`,
    expectedOutput: "Value: 100",
    solutionSnippet: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        try (Scanner sc = new Scanner("100")) {\n            int val = sc.nextInt();\n            System.out.println("Value: " + val);\n        }\n    }\n}`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 40,
    title: "Java Final Field Reassignment Compiler Error",
    description: "Fix modifying a final constant variable after initialization.",
    language: "Java",
    difficulty: "EASY",
    brokenCode: `public class Main {\n    public static void main(String[] args) {\n        final int MAX_USERS = 50;\n        MAX_USERS = 100; // BUG: Cannot reassign final variable!\n        System.out.println("Max: " + MAX_USERS);\n    }\n}`,
    expectedOutput: "Max: 100",
    solutionSnippet: `public class Main {\n    public static void main(String[] args) {\n        int MAX_USERS = 50;\n        MAX_USERS = 100;\n        System.out.println("Max: " + MAX_USERS);\n    }\n}`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 41,
    title: "Java Unchecked Cast ClassCastException",
    description: "Safely verify object type using `instanceof` before casting in Java.",
    language: "Java",
    difficulty: "EASY",
    brokenCode: `public class Main {\n    public static void main(String[] args) {\n        Object obj = "123";\n        Integer num = (Integer) obj; // BUG: ClassCastException String cannot be cast to Integer!\n        System.out.println(num);\n    }\n}`,
    expectedOutput: "123",
    solutionSnippet: `public class Main {\n    public static void main(String[] args) {\n        Object obj = "123";\n        Integer num = Integer.parseInt((String) obj);\n        System.out.println(num);\n    }\n}`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 42,
    title: "Java String StringBuilder Performance Bug",
    description: "Replace inefficient String loop concatenation with StringBuilder.",
    language: "Java",
    difficulty: "MEDIUM",
    brokenCode: `public class Main {\n    public static void main(String[] args) {\n        String s = "";\n        for (int i = 1; i <= 3; i++) s += i; // Inefficient immutable string allocation\n        System.out.println(s);\n    }\n}`,
    expectedOutput: "123",
    solutionSnippet: `public class Main {\n    public static void main(String[] args) {\n        StringBuilder sb = new StringBuilder();\n        for (int i = 1; i <= 3; i++) sb.append(i);\n        System.out.println(sb.toString());\n    }\n}`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 43,
    title: "Java Abstract Method Body Compiler Error",
    description: "Fix abstract method declaring an explicit body in Java.",
    language: "Java",
    difficulty: "EASY",
    brokenCode: `abstract class Vehicle {\n    abstract void start() { // BUG: Abstract methods cannot have a body!\n        System.out.println("Starting");\n    }\n}`,
    expectedOutput: "Starting",
    solutionSnippet: `abstract class Vehicle {\n    abstract void start();\n}\nclass Car extends Vehicle {\n    void start() { System.out.println("Starting"); }\n}\npublic class Main {\n    public static void main(String[] args) {\n        new Car().start();\n    }\n}`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 44,
    title: "Java Stream Filter Collector Syntax Bug",
    description: "Fix Stream API collect reduction syntax error in Java 8+.",
    language: "Java",
    difficulty: "MEDIUM",
    brokenCode: `import java.util.*;\nimport java.util.stream.*;\npublic class Main {\n    public static void main(String[] args) {\n        List<Integer> nums = Arrays.asList(1, 2, 3, 4);\n        List<Integer> evens = nums.stream().filter(n -> n % 2 == 0); // BUG: Missing .collect(Collectors.toList())\n        System.out.println(evens);\n    }\n}`,
    expectedOutput: "[2, 4]",
    solutionSnippet: `import java.util.*;\nimport java.util.stream.*;\npublic class Main {\n    public static void main(String[] args) {\n        List<Integer> nums = Arrays.asList(1, 2, 3, 4);\n        List<Integer> evens = nums.stream().filter(n -> n % 2 == 0).collect(Collectors.toList());\n        System.out.println(evens);\n    }\n}`,
    marks: 10,
    status: "ACTIVE"
  },
  {
    problemId: 45,
    title: "Java Switch Expression Missing Yield Error",
    description: "Fix missing yield/arrow in Java modern switch expression.",
    language: "Java",
    difficulty: "EASY",
    brokenCode: `public class Main {\n    public static void main(String[] args) {\n        int day = 1;\n        String type = switch (day) {\n            case 1 -> "Weekday"; // Correct arrow switch\n            default -> "Weekend";\n        };\n        System.out.println(type);\n    }\n}`,
    expectedOutput: "Weekday",
    solutionSnippet: `public class Main {\n    public static void main(String[] args) {\n        int day = 1;\n        String type = switch (day) {\n            case 1 -> "Weekday";\n            default -> "Weekend";\n        };\n        System.out.println(type);\n    }\n}`,
    marks: 10,
    status: "ACTIVE"
  },

  // BONUS / PRACTICE PROBLEMS (5 Problems: C++, JS, Python, Java)
  {
    problemId: 46,
    title: "C++ Vector Out-of-Bounds At Method Bug",
    description: "Bonus Practice: Debug C++ std::vector element access using safe .at() bounds checking.",
    language: "C++",
    difficulty: "MEDIUM",
    brokenCode: `#include <iostream>\n#include <vector>\n\nint main() {\n    std::vector<int> v = {10, 20, 30};\n    std::cout << v.at(5) << std::endl; // BUG: Throws std::out_of_range exception!\n    return 0;\n}`,
    expectedOutput: "30",
    solutionSnippet: `#include <iostream>\n#include <vector>\n\nint main() {\n    std::vector<int> v = {10, 20, 30};\n    std::cout << v.at(2) << std::endl;\n    return 0;\n}`,
    marks: 0,
    status: "ACTIVE",
    isBonus: true
  },
  {
    problemId: 47,
    title: "JavaScript Async/Await Unhandled Rejection Bug",
    description: "Bonus Practice: Handle async promise rejection in JavaScript.",
    language: "JavaScript",
    difficulty: "MEDIUM",
    brokenCode: `async function fetchData() {\n    throw new Error("Network Failed");\n}\nasync function main() {\n    let res = await fetchData(); // BUG: Unhandled promise rejection!\n    console.log(res);\n}\nmain();`,
    expectedOutput: "Caught: Network Failed",
    solutionSnippet: `async function fetchData() {\n    throw new Error("Network Failed");\n}\nasync function main() {\n    try {\n        let res = await fetchData();\n    } catch(err) {\n        console.log("Caught: " + err.message);\n    }\n}\nmain();`,
    marks: 0,
    status: "ACTIVE",
    isBonus: true
  },
  {
    problemId: 48,
    title: "C++ Smart Pointer Memory Ownership Bug",
    description: "Bonus Practice: Fix std::unique_ptr double copy assignment error in C++11.",
    language: "C++",
    difficulty: "HARD",
    brokenCode: `#include <iostream>\n#include <memory>\n\nint main() {\n    std::unique_ptr<int> p1 = std::make_unique<int>(100);\n    std::unique_ptr<int> p2 = p1; // BUG: std::unique_ptr cannot be copied!\n    std::cout << *p2 << std::endl;\n    return 0;\n}`,
    expectedOutput: "100",
    solutionSnippet: `#include <iostream>\n#include <memory>\n\nint main() {\n    std::unique_ptr<int> p1 = std::make_unique<int>(100);\n    std::unique_ptr<int> p2 = std::move(p1);\n    std::cout << *p2 << std::endl;\n    return 0;\n}`,
    marks: 0,
    status: "ACTIVE",
    isBonus: true
  },
  {
    problemId: 49,
    title: "JavaScript Scope Binding in Callback Functions",
    description: "Bonus Practice: Fix arrow function vs standard function `this` binding in JS.",
    language: "JavaScript",
    difficulty: "MEDIUM",
    brokenCode: `const obj = {\n    name: "TechNova",\n    getName: function() {\n        setTimeout(function() {\n            console.log(this.name); // BUG: 'this' is undefined/window in regular callback\n        }, 100);\n    }\n};\nobj.getName();`,
    expectedOutput: "TechNova",
    solutionSnippet: `const obj = {\n    name: "TechNova",\n    getName: function() {\n        setTimeout(() => {\n            console.log(this.name);\n        }, 100);\n    }\n};\nobj.getName();`,
    marks: 0,
    status: "ACTIVE",
    isBonus: true
  },
  {
    problemId: 50,
    title: "Python Multiple Inheritance MRO Method Resolution Bug",
    description: "Bonus Practice: Understand Python Method Resolution Order (MRO) with super().",
    language: "Python",
    difficulty: "HARD",
    brokenCode: `class A:\n    def show(self):\n        print("A")\n\nclass B(A):\n    def show(self):\n        A.show(self)\n        print("B")\n\nclass C(A):\n    def show(self):\n        A.show(self)\n        print("C")\n\nclass D(B, C):\n    def show(self):\n        super().show()\n        print("D")\n\nD().show()`,
    expectedOutput: "A\nC\nB\nD",
    solutionSnippet: `class A:\n    def show(self):\n        print("A")\n\nclass B(A):\n    def show(self):\n        super().show()\n        print("B")\n\nclass C(A):\n    def show(self):\n        super().show()\n        print("C")\n\nclass D(B, C):\n    def show(self):\n        super().show()\n        print("D")\n\nD().show()`,
    marks: 0,
    status: "ACTIVE",
    isBonus: true
  }
];

// --- BANK 3: 50 TECH HUNT RIDDLES (Round 3) ---
export const seedTechClues = Array.from({ length: 50 }, (_, i) => {
  const stationId = i + 1;

  const riddles = [
    { title: "The Silicon Gateway", text: "I speak in binary, holding the secrets of hardware gates and circuit logic. Find my station near the main entrance terminal.", hint: "🔍 Roadmap: Walk towards the main circuit block entrance where the primary server rack indicator lights flicker.", answer: "CIRCUIT_GATEWAY" },
    { title: "The Compiler's Beacon", text: "I translate human thought into machine code instructions. Find the terminal running GCC.", hint: "🔍 Roadmap: Look near the 3rd floor workstation running terminal logs.", answer: "COMPILER_BEACON" },
    { title: "The Encrypted Vault", text: "Zeroes and ones guard my threshold. RSA keys lock my payload.", hint: "🔍 Roadmap: Check the security laboratory workstation.", answer: "ENCRYPTED_VAULT" },
    { title: "The Quantum Core", text: "Superposition allows me to be 0 and 1 simultaneously.", hint: "🔍 Roadmap: Search near the AI & Advanced Computing lab terminal.", answer: "QUANTUM_CORE" },
    { title: "The Network Switchboard", text: "Packets flow through my copper veins at gigabit speed.", hint: "🔍 Roadmap: Locate the central Cisco patch panel in the server room.", answer: "NETWORK_SWITCHBOARD" }
  ];

  const template = riddles[i % 5];
  return {
    clueId: stationId,
    id: stationId,
    station: stationId,
    category: `Station ${stationId}`,
    title: `${template.title} #${stationId}`,
    clueText: `${template.text} (Checkpoint Station ${stationId})`,
    answer: `${template.answer}_STATION_${stationId}`,
    hint: `${template.hint} (Checkpoint #${stationId})`,
    hintPenalty: 2,
    marks: 10,
    order: stationId,
    status: "ACTIVE"
  };
});
