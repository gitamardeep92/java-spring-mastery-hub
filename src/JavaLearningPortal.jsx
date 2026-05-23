import { useState } from "react";

function makeCode(lang, lines) { return { type: "code", lang, lines }; }
function makeText(text) { return { type: "text", text }; }
function makeHeading(text) { return { type: "heading", text }; }
function makeBullet(text) { return { type: "bullet", text }; }
function makeTable(rows) { return { type: "table", rows }; }

const curriculum = [
  {
    id: "core-java", icon: "☕", title: "Core Java", color: "#f59e0b", accent: "#fbbf24",
    topics: [
      {
        title: "JVM, JDK & JRE Architecture", level: "Beginner",
        blocks: [
          makeText("The JVM is the engine that runs Java bytecode. Understanding its architecture is critical for writing performant production code."),
          makeHeading("JVM Components:"),
          makeBullet("**Class Loader**: Loads .class files into memory (Bootstrap → Extension → Application)"),
          makeBullet("**Runtime Data Areas**: Heap, Stack, Method Area, PC Register, Native Method Stack"),
          makeBullet("**Execution Engine**: Interpreter + JIT Compiler + Garbage Collector"),
          makeBullet("**JDK** = JRE + Dev Tools (javac, jar, jdb) | **JRE** = JVM + Core Libraries"),
          makeHeading("Production Use Case — Tuning JVM for a Payment Service:"),
          makeCode("bash", [
            "java -Xms2g -Xmx4g \\",
            "     -XX:+UseG1GC \\",
            "     -XX:MaxGCPauseMillis=200 \\",
            "     -XX:+HeapDumpOnOutOfMemoryError \\",
            "     -XX:HeapDumpPath=/var/log/payment-service/heap.hprof \\",
            "     -Dspring.profiles.active=prod \\",
            "     -jar payment-service.jar",
          ]),
          makeText("G1GC is preferred in microservices for predictable pause times. The heap dump flag is essential — in production, you NEED a dump when OOM occurs to diagnose memory leaks."),
        ],
      },
      {
        title: "OOP Principles (SOLID in Practice)", level: "Beginner",
        blocks: [
          makeText("Production code demands SOLID principles — not just inheritance for its own sake."),
          makeHeading("S — Single Responsibility"),
          makeCode("java", [
            "// BAD: One class does everything",
            "class OrderService {",
            "    void processOrder(Order o) { ... }",
            "    void sendEmail(Order o) { ... }         // Not order's job",
            "    void generateInvoicePDF(Order o) { ... }",
            "}",
            "",
            "// GOOD: Each class has one reason to change",
            "class OrderService        { void processOrder(Order o)        { ... } }",
            "class NotificationService { void sendEmail(Order o)           { ... } }",
            "class InvoiceService      { void generateInvoicePDF(Order o)  { ... } }",
          ]),
          makeHeading("O — Open/Closed"),
          makeCode("java", [
            "public interface PaymentGateway {",
            "    PaymentResult charge(PaymentRequest request);",
            "}",
            "@Service(\"stripe\")   class StripeGateway   implements PaymentGateway { ... }",
            "@Service(\"razorpay\") class RazorpayGateway implements PaymentGateway { ... }",
            "// Adding PayPal? Zero changes to existing code.",
          ]),
          makeHeading("I — Interface Segregation"),
          makeCode("java", [
            "// GOOD: Segregated interfaces",
            "interface UserReadRepository      { User findById(Long id); }",
            "interface UserWriteRepository     { void save(User u); }",
            "interface UserAnalyticsRepository { List<User> complexQuery(); }",
          ]),
          makeHeading("D — Dependency Inversion"),
          makeCode("java", [
            "@Service",
            "public class OrderProcessor {",
            "    private final PaymentGateway paymentGateway; // Abstraction, not impl",
            "    public OrderProcessor(PaymentGateway paymentGateway) {",
            "        this.paymentGateway = paymentGateway; // Injected by Spring",
            "    }",
            "}",
          ]),
        ],
      },
      {
        title: "Collections Framework Deep Dive", level: "Intermediate",
        blocks: [
          makeText("Choosing the wrong collection is a silent killer in production."),
          makeHeading("Big-O Complexity:"),
          makeTable([
            ["Collection", "get", "add", "contains"],
            ["ArrayList", "O(1)", "O(1) amortized", "O(n)"],
            ["LinkedList", "O(n)", "O(1)", "O(n)"],
            ["HashMap", "O(1) avg", "O(1) avg", "O(1) avg"],
            ["TreeMap", "O(log n)", "O(log n)", "O(log n)"],
            ["HashSet", "O(1) avg", "O(1) avg", "O(1) avg"],
          ]),
          makeHeading("Production Use Case — E-commerce Cart Service:"),
          makeCode("java", [
            "// LinkedHashMap: preserves insertion order (cart item order matters for UX)",
            "Map<String, CartItem> cart = new LinkedHashMap<>();",
            "",
            "// ConcurrentHashMap: thread-safe session store",
            "ConcurrentHashMap<String, UserSession> sessions = new ConcurrentHashMap<>();",
            "",
            "// PriorityQueue: process orders by priority",
            "PriorityQueue<Order> queue = new PriorityQueue<>(",
            "    Comparator.comparingInt(Order::getPriority).reversed());",
            "",
            "// Deduplication: Set = O(1) lookup vs List = O(n)",
            "Set<String> processedOrderIds = new HashSet<>(); // GOOD",
            "// List<String> processedIds = new ArrayList<>(); // BAD - O(n) contains()",
          ]),
          makeHeading("Race Condition in Inventory — Real Production Bug:"),
          makeCode("java", [
            "// BAD: Two threads read stock=1, both sell it",
            "int stock = inventory.get(sku);",
            "if (stock > 0) inventory.put(sku, stock - 1); // NOT ATOMIC",
            "",
            "// GOOD: compute() is atomic in ConcurrentHashMap",
            "inventory.compute(sku, (key, current) -> {",
            "    if (current == null || current <= 0)",
            "        throw new InsufficientInventoryException(sku);",
            "    return current - 1;",
            "});",
          ]),
        ],
      },
      {
        title: "Exception Handling & Custom Exceptions", level: "Intermediate",
        blocks: [
          makeText("Exception handling done wrong leads to silent failures and impossible-to-debug production incidents."),
          makeHeading("Production-Grade Custom Exception Hierarchy:"),
          makeCode("java", [
            "public abstract class DomainException extends RuntimeException {",
            "    private final String errorCode;",
            "    private final HttpStatus httpStatus;",
            "    protected DomainException(String message, String code, HttpStatus status) {",
            "        super(message); this.errorCode = code; this.httpStatus = status;",
            "    }",
            "}",
            "",
            "public class OrderNotFoundException extends DomainException {",
            "    public OrderNotFoundException(Long orderId) {",
            "        super(\"Order not found: \" + orderId,",
            "              \"ORDER_NOT_FOUND\", HttpStatus.NOT_FOUND);",
            "    }",
            "}",
            "",
            "public class InsufficientInventoryException extends DomainException {",
            "    public InsufficientInventoryException(String sku) {",
            "        super(\"Out of stock: \" + sku,",
            "              \"INSUFFICIENT_INVENTORY\", HttpStatus.CONFLICT);",
            "    }",
            "}",
          ]),
          makeHeading("Global Exception Handler:"),
          makeCode("java", [
            "@RestControllerAdvice",
            "public class GlobalExceptionHandler {",
            "",
            "    @ExceptionHandler(DomainException.class)",
            "    public ResponseEntity<ErrorResponse> handleDomain(DomainException ex) {",
            "        return ResponseEntity.status(ex.getHttpStatus())",
            "            .body(new ErrorResponse(ex.getErrorCode(),",
            "                                    ex.getMessage(), Instant.now()));",
            "    }",
            "",
            "    @ExceptionHandler(Exception.class)",
            "    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {",
            "        log.error(\"Unhandled exception\", ex); // ALWAYS LOG FULL STACK",
            "        return ResponseEntity.internalServerError()",
            "            .body(new ErrorResponse(\"INTERNAL_ERROR\",",
            "                                    \"Something went wrong\", Instant.now()));",
            "    }",
            "}",
          ]),
          makeHeading("try-with-resources (Always use for I/O):"),
          makeCode("java", [
            "try (Connection conn = dataSource.getConnection();",
            "     PreparedStatement ps = conn.prepareStatement(SQL)) {",
            "    // DB operations",
            "} // conn and ps auto-closed — no finally block needed",
          ]),
        ],
      },
      {
        title: "Multithreading & Concurrency", level: "Advanced",
        blocks: [
          makeText("Concurrency bugs are the hardest to reproduce. Production systems MUST handle this correctly."),
          makeHeading("ExecutorService — Never Use Raw Threads in Production:"),
          makeCode("java", [
            "// NEVER do this:",
            "new Thread(() -> processOrder(order)).start(); // Uncontrolled!",
            "",
            "// Use a bounded thread pool with backpressure:",
            "ThreadPoolExecutor executor = new ThreadPoolExecutor(",
            "    10, 50,                           // core / max pool size",
            "    60, TimeUnit.SECONDS,             // keepAliveTime",
            "    new ArrayBlockingQueue<>(1000),   // bounded queue",
            "    new CallerRunsPolicy()            // slow caller, don't drop tasks",
            ");",
          ]),
          makeHeading("CompletableFuture — Parallel Service Calls:"),
          makeCode("java", [
            "// Call 3 services in parallel, combine results",
            "CompletableFuture<UserProfile> userF =",
            "    CompletableFuture.supplyAsync(() -> userService.getUser(userId), exec);",
            "CompletableFuture<List<Order>> ordersF =",
            "    CompletableFuture.supplyAsync(() -> orderService.getOrders(userId), exec);",
            "CompletableFuture<CreditScore> creditF =",
            "    CompletableFuture.supplyAsync(() -> creditService.getScore(userId), exec);",
            "",
            "CompletableFuture.allOf(userF, ordersF, creditF)",
            "    .thenApply(v -> new DashboardData(",
            "        userF.join(), ordersF.join(), creditF.join()))",
            "    .exceptionally(ex -> {",
            "        log.error(\"Dashboard fetch failed\", ex);",
            "        return DashboardData.empty();",
            "    });",
          ]),
          makeHeading("Virtual Threads (Java 21 — Project Loom):"),
          makeCode("java", [
            "// Old: limited to ~thousands of platform threads",
            "// New: millions of virtual threads, JVM handles scheduling",
            "try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {",
            "    IntStream.range(0, 100_000).forEach(i ->",
            "        executor.submit(() -> callExternalAPI(i))",
            "    );",
            "} // 100k concurrent I/O calls with no blocking worries!",
          ]),
        ],
      },
      {
        title: "Java 8–21 Modern Features", level: "Advanced",
        blocks: [
          makeHeading("Streams API — Declarative Data Processing:"),
          makeCode("java", [
            "List<OrderSummary> top100 = orders.stream()",
            "    .filter(o -> o.getStatus() == OrderStatus.COMPLETED)",
            "    .filter(o -> o.getCreatedAt().isAfter(startDate))",
            "    .collect(Collectors.groupingBy(",
            "        Order::getCustomerId,",
            "        Collectors.collectingAndThen(Collectors.toList(),",
            "            list -> new OrderSummary(",
            "                list.get(0).getCustomerId(),",
            "                list.stream().mapToDouble(Order::getTotal).sum(),",
            "                list.size()))))",
            "    .values().stream()",
            "    .sorted(Comparator.comparingDouble(OrderSummary::getTotal).reversed())",
            "    .limit(100)",
            "    .collect(Collectors.toList());",
          ]),
          makeHeading("Optional — Eliminate NullPointerExceptions:"),
          makeCode("java", [
            "String msg = userRepository.findById(userId)",
            "    .filter(User::isPremium)",
            "    .map(u -> discountService.getDiscount(u.getTier()))",
            "    .map(d -> String.format(\"You saved %.2f%%!\", d.getPercent()))",
            "    .orElse(\"No discount available\");",
          ]),
          makeHeading("Records (Java 16+) — Immutable Value Objects:"),
          makeCode("java", [
            "public record PaymentRequest(",
            "    String orderId, BigDecimal amount, String currency) {",
            "    public PaymentRequest {",
            "        Objects.requireNonNull(orderId, \"orderId required\");",
            "        if (amount.compareTo(BigDecimal.ZERO) <= 0)",
            "            throw new IllegalArgumentException(\"Amount must be positive\");",
            "    }",
            "}",
            "// Auto-generated: constructor, getters, equals, hashCode, toString",
          ]),
          makeHeading("Sealed Classes + Pattern Matching (Java 17/21):"),
          makeCode("java", [
            "public sealed interface PaymentResult",
            "    permits PaymentSuccess, PaymentFailure, PaymentPending {}",
            "",
            "public record PaymentSuccess(String txnId, Instant at) implements PaymentResult {}",
            "public record PaymentFailure(String code, String reason) implements PaymentResult {}",
            "public record PaymentPending(String refId)              implements PaymentResult {}",
            "",
            "// Compiler enforces all cases are covered",
            "String message = switch (result) {",
            "    case PaymentSuccess s -> \"Transaction: \" + s.txnId();",
            "    case PaymentFailure f -> \"Failed: \"      + f.reason();",
            "    case PaymentPending p -> \"Pending: \"     + p.refId();",
            "};",
          ]),
        ],
      },
    ],
  },
  {
    id: "spring-boot", icon: "🍃", title: "Spring Boot", color: "#22c55e", accent: "#4ade80",
    topics: [
      {
        title: "Spring Core: IoC & Dependency Injection", level: "Beginner",
        blocks: [
          makeText("Spring's Inversion of Control container is the backbone of every Spring application. Understanding it deeply prevents mysterious bugs."),
          makeHeading("3 Types of DI — Constructor Injection is King:"),
          makeCode("java", [
            "// PREFERRED: Constructor Injection",
            "@Service",
            "public class OrderService {",
            "    private final PaymentGateway paymentGateway;   // final = immutable",
            "    private final InventoryService inventoryService;",
            "",
            "    public OrderService(PaymentGateway pg, InventoryService is) {",
            "        this.paymentGateway   = pg;",
            "        this.inventoryService = is;",
            "    }",
            "}",
            "",
            "// AVOID: Field Injection (hides dependencies, breaks testing)",
            "// @Autowired private PaymentGateway pg; // BAD",
          ]),
          makeHeading("Bean Scopes:"),
          makeCode("java", [
            "@Scope(\"singleton\")  // Default: one instance per ApplicationContext",
            "@Scope(\"prototype\")  // New instance per injection/getBean()",
            "@Scope(\"request\")    // New instance per HTTP request",
            "@Scope(\"session\")    // New instance per HTTP session",
            "",
            "// TRAP: Injecting prototype into singleton = only one prototype created!",
            "// Fix: use ObjectProvider<ReportBuilder>",
            "@Service",
            "public class ReportService {",
            "    private final ObjectProvider<ReportBuilder> provider;",
            "    public Report generate() {",
            "        return provider.getObject().build(); // Fresh instance every call",
            "    }",
            "}",
          ]),
          makeHeading("Configuration & Bean Lifecycle:"),
          makeCode("java", [
            "@Configuration",
            "public class DataSourceConfig {",
            "",
            "    @Bean @Primary",
            "    public DataSource primaryDataSource() {",
            "        HikariConfig config = new HikariConfig();",
            "        config.setJdbcUrl(\"jdbc:postgresql://primary:5432/orders\");",
            "        config.setMaximumPoolSize(20);",
            "        config.setMinimumIdle(5);",
            "        return new HikariDataSource(config);",
            "    }",
            "",
            "    @PostConstruct // Runs after all dependencies injected",
            "    public void warmUp() { ... }",
            "",
            "    @PreDestroy // Runs on shutdown — clean up resources!",
            "    public void close() { ... }",
            "}",
          ]),
        ],
      },
      {
        title: "Spring Boot Auto-Configuration", level: "Intermediate",
        blocks: [
          makeText("Spring Boot's magic is auto-configuration. Understanding it lets you customize behavior and diagnose conflicts."),
          makeHeading("How Auto-Configuration Works:"),
          makeCode("text", [
            "1. @SpringBootApplication includes @EnableAutoConfiguration",
            "2. Reads META-INF/spring/...AutoConfiguration.imports",
            "3. ~150 AutoConfiguration classes evaluated",
            "4. Each uses @ConditionalOn* annotations to activate",
          ]),
          makeHeading("Key Conditional Annotations:"),
          makeCode("java", [
            "@ConditionalOnClass(DataSource.class)       // Activate if class on classpath",
            "@ConditionalOnMissingBean(DataSource.class) // Only if user hasn't defined one",
            "@ConditionalOnProperty(\"feature.enabled\", havingValue = \"true\")",
            "@ConditionalOnWebApplication                // Only in web context",
          ]),
          makeHeading("Debugging — See What Was Auto-Configured:"),
          makeCode("bash", [
            "# Shows CONDITIONS EVALUATION REPORT on startup",
            "java -jar app.jar --debug",
            "# Or: debug=true in application.properties",
          ]),
          makeHeading("Writing Your Own Starter (Shared Libraries):"),
          makeCode("java", [
            "@Configuration",
            "@ConditionalOnClass(RedisTemplate.class)",
            "@ConditionalOnProperty(prefix = \"mycompany.cache\",",
            "                       name = \"enabled\", matchIfMissing = true)",
            "public class CompanyCacheAutoConfiguration {",
            "",
            "    @Bean @ConditionalOnMissingBean",
            "    public CacheManager cacheManager(CacheProperties props) {",
            "        return new RedisCacheManager(...);",
            "    }",
            "}",
            "// Register in: META-INF/spring/AutoConfiguration.imports",
          ]),
        ],
      },
      {
        title: "Spring Data JPA & Database Layer", level: "Intermediate",
        blocks: [
          makeText("The data layer is where most production performance issues originate."),
          makeHeading("Entity Design — Production Patterns:"),
          makeCode("java", [
            "@Entity",
            "@Table(name = \"orders\", indexes = {",
            "    @Index(columnList = \"customer_id\"),",
            "    @Index(columnList = \"status, created_at\")",
            "})",
            "public class Order {",
            "    @Id @GeneratedValue(strategy = GenerationType.SEQUENCE)",
            "    private Long id;",
            "",
            "    @Enumerated(EnumType.STRING) // ALWAYS STRING, never ORDINAL",
            "    private OrderStatus status;",
            "",
            "    @ManyToOne(fetch = FetchType.LAZY) // ALWAYS LAZY for associations!",
            "    @JoinColumn(name = \"customer_id\")",
            "    private Customer customer;",
            "",
            "    @Version private Long version; // Optimistic locking",
            "    @CreatedDate      private Instant createdAt;",
            "    @LastModifiedDate private Instant updatedAt;",
            "}",
          ]),
          makeHeading("The N+1 Problem — #1 Production Performance Killer:"),
          makeCode("java", [
            "// BAD: 1 query to get orders + N queries to load each customer",
            "List<Order> orders = orderRepo.findAll();",
            "orders.forEach(o -> o.getCustomer().getName()); // N lazy loads!",
            "",
            "// FIX 1: JOIN FETCH",
            "@Query(\"SELECT o FROM Order o JOIN FETCH o.customer WHERE o.status = :s\")",
            "List<Order> findByStatusWithCustomer(@Param(\"s\") OrderStatus status);",
            "",
            "// FIX 2: EntityGraph",
            "@EntityGraph(attributePaths = {\"customer\", \"items\"})",
            "List<Order> findByCustomerId(Long customerId);",
            "",
            "// FIX 3: Projections (fetch only needed columns)",
            "public interface OrderSummary {",
            "    Long getId();",
            "    @Value(\"#{target.customer.name}\") String getCustomerName();",
            "}",
          ]),
          makeHeading("Dynamic Queries with Specifications:"),
          makeCode("java", [
            "public class OrderSpecs {",
            "    public static Specification<Order> hasStatus(OrderStatus s) {",
            "        return (root, q, cb) ->",
            "            s == null ? null : cb.equal(root.get(\"status\"), s);",
            "    }",
            "    public static Specification<Order> createdAfter(Instant date) {",
            "        return (root, q, cb) ->",
            "            date == null ? null : cb.greaterThan(root.get(\"createdAt\"), date);",
            "    }",
            "}",
            "",
            "Page<Order> results = repo.findAll(",
            "    Specification.where(hasStatus(filter.getStatus()))",
            "                 .and(createdAfter(filter.getFrom())), pageable);",
          ]),
        ],
      },
      {
        title: "Spring Security — JWT & Authorization", level: "Advanced",
        blocks: [
          makeText("Security is non-negotiable. A single misconfiguration can expose your entire system."),
          makeHeading("Security Filter Chain:"),
          makeCode("java", [
            "@Configuration @EnableWebSecurity @EnableMethodSecurity",
            "public class SecurityConfig {",
            "",
            "    @Bean",
            "    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {",
            "        return http",
            "            .csrf(csrf -> csrf.disable())  // Stateless API",
            "            .sessionManagement(s ->",
            "                s.sessionCreationPolicy(STATELESS))",
            "            .authorizeHttpRequests(auth -> auth",
            "                .requestMatchers(\"/api/v1/auth/**\").permitAll()",
            "                .requestMatchers(\"/actuator/health\").permitAll()",
            "                .requestMatchers(\"/api/v1/admin/**\").hasRole(\"ADMIN\")",
            "                .anyRequest().authenticated())",
            "            .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()))",
            "            .build();",
            "    }",
            "}",
          ]),
          makeHeading("JWT Authentication Filter:"),
          makeCode("java", [
            "@Component",
            "public class JwtAuthFilter extends OncePerRequestFilter {",
            "    protected void doFilterInternal(HttpServletRequest req,",
            "            HttpServletResponse res, FilterChain chain)",
            "            throws ServletException, IOException {",
            "        String header = req.getHeader(\"Authorization\");",
            "        if (header == null || !header.startsWith(\"Bearer \")) {",
            "            chain.doFilter(req, res); return;",
            "        }",
            "        try {",
            "            Claims claims = jwtService.validate(header.substring(7));",
            "            List<SimpleGrantedAuthority> roles = claims",
            "                .get(\"roles\", List.class).stream()",
            "                .map(SimpleGrantedAuthority::new).collect(toList());",
            "            SecurityContextHolder.getContext().setAuthentication(",
            "                new UsernamePasswordAuthenticationToken(",
            "                    claims.getSubject(), null, roles));",
            "        } catch (JwtException e) {",
            "            res.sendError(401, \"Invalid token\"); return;",
            "        }",
            "        chain.doFilter(req, res);",
            "    }",
            "}",
          ]),
          makeHeading("Method-Level Security:"),
          makeCode("java", [
            "@PreAuthorize(\"hasRole('ADMIN') or #userId == authentication.name\")",
            "public List<Order> getOrdersForUser(String userId) { ... }",
            "",
            "@PostAuthorize(\"returnObject.customerId == authentication.name\")",
            "public Order getOrder(Long orderId) { ... }",
          ]),
        ],
      },
      {
        title: "Actuator & Observability", level: "Advanced",
        blocks: [
          makeText("You can't manage what you can't observe. Production systems need deep visibility."),
          makeHeading("Actuator Setup (application.yml):"),
          makeCode("yaml", [
            "management:",
            "  endpoints:",
            "    web:",
            "      exposure:",
            "        include: health, info, metrics, prometheus, loggers",
            "  endpoint:",
            "    health:",
            "      show-details: when_authorized",
            "      probes:",
            "        enabled: true  # Kubernetes liveness/readiness probes",
            "  metrics:",
            "    export:",
            "      prometheus:",
            "        enabled: true",
          ]),
          makeHeading("Custom Health Indicator:"),
          makeCode("java", [
            "@Component",
            "public class PaymentGatewayHealth implements HealthIndicator {",
            "    public Health health() {",
            "        try {",
            "            stripeClient.ping();",
            "            return Health.up()",
            "                .withDetail(\"status\", \"Stripe reachable\").build();",
            "        } catch (Exception e) {",
            "            return Health.down()",
            "                .withDetail(\"error\", e.getMessage())",
            "                .withDetail(\"impact\", \"Payments unavailable\").build();",
            "        }",
            "    }",
            "}",
          ]),
          makeHeading("Custom Metrics with Micrometer:"),
          makeCode("java", [
            "@Service",
            "public class OrderService {",
            "    private final Counter ordersProcessed;",
            "    private final Timer processingTime;",
            "",
            "    public OrderService(MeterRegistry registry, OrderRepository repo) {",
            "        ordersProcessed = Counter.builder(\"orders.processed.total\")",
            "            .tag(\"service\", \"order-service\").register(registry);",
            "        processingTime = Timer.builder(\"order.processing.duration\")",
            "            .publishPercentiles(0.5, 0.95, 0.99).register(registry);",
            "        Gauge.builder(\"orders.pending\", repo,",
            "            OrderRepository::countPending).register(registry);",
            "    }",
            "",
            "    public Order processOrder(OrderRequest req) {",
            "        return processingTime.recordCallable(() -> {",
            "            Order o = doProcess(req);",
            "            ordersProcessed.increment();",
            "            return o;",
            "        });",
            "    }",
            "}",
          ]),
        ],
      },
    ],
  },
  {
    id: "microservices", icon: "🔬", title: "Microservices", color: "#6366f1", accent: "#818cf8",
    topics: [
      {
        title: "Microservices Architecture Patterns", level: "Intermediate",
        blocks: [
          makeText("Microservices are not just small services — they are a set of architectural patterns with clear trade-offs."),
          makeHeading("Domain-Driven Design — How to Split Services:"),
          makeCode("text", [
            "         API Gateway (single entry point)",
            "          /     |       |       |      \\",
            "      Order   User   Catalog  Payment  Shipping",
            "      Svc     Svc     Svc      Svc      Svc",
            "        |       |       |        |        |",
            "     OrderDB  UserDB  ItemDB   TxnDB  ShipDB",
            "",
            "Key Principle: Each service OWNS its data — NO shared databases!",
          ]),
          makeHeading("Synchronous (REST + Feign):"),
          makeCode("java", [
            "@FeignClient(name = \"payment-service\",",
            "             fallbackFactory = PaymentFallbackFactory.class)",
            "public interface PaymentClient {",
            "    @PostMapping(\"/api/v1/payments\")",
            "    PaymentResult charge(@RequestBody PaymentRequest req);",
            "}",
            "",
            "@Component",
            "class PaymentFallbackFactory implements FallbackFactory<PaymentClient> {",
            "    public PaymentClient create(Throwable cause) {",
            "        return req -> PaymentResult.pending(\"CIRCUIT_OPEN\");",
            "    }",
            "}",
          ]),
          makeHeading("Asynchronous (Event-Driven with Kafka):"),
          makeCode("java", [
            "@Service",
            "public class OrderService {",
            "    public Order placeOrder(OrderRequest req) {",
            "        Order order = createAndSave(req);",
            "        kafkaTemplate.send(\"order.placed\", OrderPlacedEvent.from(order));",
            "        return order; // Return immediately — don't wait for downstream",
            "    }",
            "}",
            "",
            "@KafkaListener(topics = \"order.placed\", groupId = \"inventory-service\")",
            "public void handleOrderPlaced(OrderPlacedEvent event) {",
            "    inventoryService.reserve(event.getItems());",
            "}",
          ]),
        ],
      },
      {
        title: "API Gateway & Service Discovery", level: "Intermediate",
        blocks: [
          makeText("The API Gateway is the front door to your microservices, handling cross-cutting concerns centrally."),
          makeHeading("Spring Cloud Gateway Configuration:"),
          makeCode("yaml", [
            "spring:",
            "  cloud:",
            "    gateway:",
            "      routes:",
            "        - id: order-service",
            "          uri: lb://ORDER-SERVICE  # lb:// = load balanced",
            "          predicates:",
            "            - Path=/api/v1/orders/**",
            "          filters:",
            "            - name: CircuitBreaker",
            "              args:",
            "                name: order-cb",
            "                fallbackUri: forward:/fallback/orders",
            "            - name: RequestRateLimiter",
            "              args:",
            "                redis-rate-limiter.replenishRate: 100",
            "                redis-rate-limiter.burstCapacity: 200",
            "            - name: Retry",
            "              args:",
            "                retries: 3",
            "                methods: GET  # Only retry idempotent methods!",
          ]),
          makeHeading("Eureka Service Discovery:"),
          makeCode("java", [
            "// Eureka Server",
            "@SpringBootApplication @EnableEurekaServer",
            "public class ServiceRegistryApp { ... }",
            "",
            "// application.yml for each service:",
            "// spring.application.name: ORDER-SERVICE",
            "// eureka.client.serviceUrl.defaultZone: http://eureka:8761/eureka/",
            "",
            "// Load-balanced client",
            "@Bean @LoadBalanced",
            "public RestTemplate restTemplate() { return new RestTemplate(); }",
            "",
            "// Resolves ORDER-SERVICE to a real instance automatically:",
            "restTemplate.getForObject(",
            "    \"http://ORDER-SERVICE/api/v1/orders/\" + id, String.class);",
          ]),
        ],
      },
      {
        title: "Resilience: Circuit Breaker & Bulkhead", level: "Advanced",
        blocks: [
          makeText("In distributed systems, failures are inevitable. Resilience patterns prevent cascading failures from taking down your entire platform."),
          makeHeading("Circuit Breaker States:"),
          makeCode("text", [
            "CLOSED (normal) -> failure rate > 50% -> OPEN (reject all)",
            "  OPEN -> wait 30s -> HALF-OPEN (allow 3 test calls)",
            "  HALF-OPEN -> success -> CLOSED | failure -> OPEN",
          ]),
          makeHeading("Resilience4j Circuit Breaker Config:"),
          makeCode("yaml", [
            "resilience4j:",
            "  circuitbreaker:",
            "    instances:",
            "      payment-service:",
            "        failure-rate-threshold: 50",
            "        wait-duration-in-open-state: 30s",
            "        sliding-window-size: 10",
            "        slow-call-duration-threshold: 2s",
            "        slow-call-rate-threshold: 80",
            "  timelimiter:",
            "    instances:",
            "      payment-service:",
            "        timeout-duration: 3s",
          ]),
          makeHeading("Bulkhead — Isolate Thread Pools per Service:"),
          makeCode("yaml", [
            "# Separate thread pools: slow payment won't starve inventory",
            "resilience4j:",
            "  bulkhead:",
            "    instances:",
            "      payment-service:",
            "        maxConcurrentCalls: 20",
            "        maxWaitDuration: 100ms",
            "      inventory-service:",
            "        maxConcurrentCalls: 50",
            "        maxWaitDuration: 50ms",
          ]),
          makeHeading("Retry with Exponential Backoff:"),
          makeCode("yaml", [
            "resilience4j:",
            "  retry:",
            "    instances:",
            "      email-service:",
            "        maxAttempts: 3",
            "        waitDuration: 500ms",
            "        exponentialBackoffMultiplier: 2.0  # 500ms, 1s, 2s",
            "        retryExceptions:",
            "          - java.net.ConnectException",
            "        ignoreExceptions:",
            "          - com.example.ValidationException  # Don't retry 4xx!",
          ]),
        ],
      },
      {
        title: "Event-Driven Architecture with Kafka", level: "Advanced",
        blocks: [
          makeText("Apache Kafka is the backbone of event-driven microservices, providing durability, scalability, and decoupling."),
          makeHeading("Kafka Topology:"),
          makeCode("text", [
            "Topic: order.events (3 partitions, 3 replicas)",
            "  Partition 0: [Placed(1), Shipped(4), ...]",
            "  Partition 1: [Placed(2), Cancelled(5), ...]",
            "  Partition 2: [Placed(3), Delivered(6), ...]",
            "",
            "Consumer Groups (each gets ALL messages independently):",
            "  inventory-service   -> reserves stock",
            "  notification-service -> sends emails",
            "  analytics-service   -> updates reports",
          ]),
          makeHeading("Transactional Outbox Pattern:"),
          makeCode("java", [
            "// Guarantees DB + Kafka consistency (no lost events on crash)",
            "@Service @Transactional",
            "public class OrderService {",
            "    public Order placeOrder(OrderRequest req) {",
            "        Order order = orderRepository.save(new Order(req));",
            "",
            "        // Save event in SAME transaction as order",
            "        outboxRepository.save(new OutboxEvent(",
            "            \"order.placed\",",
            "            JsonUtils.toJson(OrderPlacedEvent.from(order))));",
            "",
            "        // Relay process publishes outbox events to Kafka",
            "        // If crash before Kafka publish: relay retries on restart",
            "        return order;",
            "    }",
            "}",
          ]),
          makeHeading("Consumer with Dead Letter Topic:"),
          makeCode("java", [
            "@KafkaListener(topics = \"order.placed\", groupId = \"inventory-service\")",
            "@RetryableTopic(",
            "    attempts = \"4\",",
            "    backoff = @Backoff(delay = 1000, multiplier = 2.0),",
            "    dltTopicSuffix = \".DLT\"",
            ")",
            "public void handleOrderPlaced(OrderPlacedEvent event) {",
            "    inventoryService.reserve(event.getItems());",
            "}",
            "",
            "@DltHandler",
            "public void handleDeadLetter(OrderPlacedEvent event) {",
            "    log.error(\"ALL retries failed for order: {}\", event.getOrderId());",
            "    alertingService.page(\"Order processing failed: \" + event.getOrderId());",
            "}",
          ]),
        ],
      },
      {
        title: "Saga Pattern for Distributed Transactions", level: "Advanced",
        blocks: [
          makeText("In microservices you can't use ACID transactions across services. The Saga pattern coordinates distributed transactions through compensating actions."),
          makeHeading("Saga Flow — Success and Failure Paths:"),
          makeCode("text", [
            "SUCCESS:",
            "  OrderCreated -> InventoryReserved -> PaymentProcessed -> ShipmentScheduled",
            "",
            "FAILURE (PaymentFailed):",
            "  PaymentFailed",
            "  <- InventoryReleased  (compensate step 2)",
            "  <- OrderCancelled     (compensate step 1)",
          ]),
          makeHeading("Orchestration Saga:"),
          makeCode("java", [
            "@Component",
            "public class OrderSagaOrchestrator {",
            "",
            "    public void execute(Order order) {",
            "        Deque<Runnable> compensations = new ArrayDeque<>();",
            "        try {",
            "            var reservation = inventoryClient.reserve(order.getItems());",
            "            compensations.push(",
            "                () -> inventoryClient.release(reservation.getId()));",
            "",
            "            var payment = paymentClient.charge(order.getPaymentInfo());",
            "            compensations.push(",
            "                () -> paymentClient.refund(payment.getTxnId()));",
            "",
            "            var shipment = shippingClient.schedule(order);",
            "            compensations.push(",
            "                () -> shippingClient.cancel(shipment.getId()));",
            "",
            "            orderService.markCompleted(order.getId());",
            "        } catch (Exception e) {",
            "            log.error(\"Saga failed, compensating...\", e);",
            "            while (!compensations.isEmpty()) {",
            "                try { compensations.pop().run(); }",
            "                catch (Exception ce) {",
            "                    log.error(\"Compensation failed\", ce);",
            "                }",
            "            }",
            "            orderService.markFailed(order.getId(), e.getMessage());",
            "        }",
            "    }",
            "}",
          ]),
        ],
      },
      {
        title: "Docker & Kubernetes Deployment", level: "Expert",
        blocks: [
          makeText("Production microservices run in containers orchestrated by Kubernetes. This is the deployment reality."),
          makeHeading("Optimized Multi-Stage Dockerfile:"),
          makeCode("dockerfile", [
            "# Stage 1: Build",
            "FROM eclipse-temurin:21-jdk-alpine AS builder",
            "WORKDIR /app",
            "COPY pom.xml .",
            "COPY src ./src",
            "RUN mvn -q package -DskipTests",
            "",
            "# Stage 2: Extract Spring Boot layers for Docker cache",
            "FROM eclipse-temurin:21-jre-alpine AS layers",
            "WORKDIR /app",
            "COPY --from=builder /app/target/*.jar app.jar",
            "RUN java -Djarmode=layertools -jar app.jar extract",
            "",
            "# Stage 3: Final minimal image",
            "FROM eclipse-temurin:21-jre-alpine",
            "WORKDIR /app",
            "COPY --from=layers /app/dependencies/ ./",
            "COPY --from=layers /app/spring-boot-loader/ ./",
            "COPY --from=layers /app/snapshot-dependencies/ ./",
            "COPY --from=layers /app/application/ ./",
            "RUN addgroup -S appgroup && adduser -S appuser -G appgroup",
            "USER appuser",
            "EXPOSE 8080",
            "ENTRYPOINT [\"java\",\"-XX:+UseContainerSupport\",\"-XX:MaxRAMPercentage=75.0\",\"org.springframework.boot.loader.JarLauncher\"]",
          ]),
          makeHeading("Kubernetes Deployment with Probes:"),
          makeCode("yaml", [
            "apiVersion: apps/v1",
            "kind: Deployment",
            "spec:",
            "  replicas: 3",
            "  strategy:",
            "    rollingUpdate: { maxUnavailable: 1, maxSurge: 1 }",
            "  template:",
            "    spec:",
            "      containers:",
            "      - name: order-service",
            "        image: myregistry/order-service:1.2.3",
            "        resources:",
            "          requests: { memory: 512Mi, cpu: 250m }",
            "          limits:   { memory: 1Gi,   cpu: 1000m }",
            "        readinessProbe:",
            "          httpGet: { path: /actuator/health/readiness, port: 8080 }",
            "          initialDelaySeconds: 20",
            "        livenessProbe:",
            "          httpGet: { path: /actuator/health/liveness, port: 8080 }",
            "          initialDelaySeconds: 30",
            "        env:",
            "        - name: DB_PASSWORD",
            "          valueFrom:",
            "            secretKeyRef:",
            "              name: order-db-secret",
            "              key: password  # Never hardcode secrets in manifests!",
          ]),
          makeHeading("Horizontal Pod Autoscaler with Custom Metrics:"),
          makeCode("yaml", [
            "apiVersion: autoscaling/v2",
            "kind: HorizontalPodAutoscaler",
            "spec:",
            "  scaleTargetRef:",
            "    kind: Deployment",
            "    name: order-service",
            "  minReplicas: 2",
            "  maxReplicas: 20",
            "  metrics:",
            "  - type: Resource",
            "    resource:",
            "      name: cpu",
            "      target: { type: Utilization, averageUtilization: 70 }",
            "  - type: Pods",
            "    pods:",
            "      metric:",
            "        name: orders_pending_count",
            "      target: { type: AverageValue, averageValue: \"100\" }",
          ]),
        ],
      },
    ],
  },
];

const levelColors = {
  Beginner:     { bg: "#dcfce7", text: "#166534" },
  Intermediate: { bg: "#fef3c7", text: "#92400e" },
  Advanced:     { bg: "#fee2e2", text: "#991b1b" },
  Expert:       { bg: "#ede9fe", text: "#4c1d95" },
};

function CodeBlock({ lang, lines, accent }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ margin: "14px 0", borderRadius: 10, overflow: "hidden", border: "1px solid #1e293b" }}>
      <div style={{ background: "#0f172a", padding: "5px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#64748b", fontSize: 11, fontFamily: "monospace" }}>{lang}</span>
        <button
          onClick={() => { navigator.clipboard?.writeText(lines.join("\n")); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          style={{ background: "none", border: "1px solid #334155", color: copied ? accent : "#94a3b8", padding: "2px 8px", borderRadius: 4, cursor: "pointer", fontSize: 10, transition: "color 0.2s" }}
        >
          {copied ? "✓ copied" : "copy"}
        </button>
      </div>
      <pre style={{ margin: 0, background: "#0a0f1e", padding: "12px 14px", overflowX: "auto", fontSize: 12, lineHeight: 1.65, color: "#e2e8f0", fontFamily: "monospace" }}>
        {lines.join("\n")}
      </pre>
    </div>
  );
}

function renderInline(text) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**"))
      return <strong key={i} style={{ color: "#f1f5f9" }}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("`") && p.endsWith("`"))
      return <code key={i} style={{ background: "#1e293b", padding: "1px 5px", borderRadius: 3, fontSize: "0.88em", color: "#7dd3fc", fontFamily: "monospace" }}>{p.slice(1, -1)}</code>;
    return p;
  });
}

function TopicView({ topic, section }) {
  return (
    <div>
      {topic.blocks.map((b, i) => {
        if (b.type === "code")
          return <CodeBlock key={i} lang={b.lang} lines={b.lines} accent={section.accent} />;
        if (b.type === "heading")
          return <p key={i} style={{ fontWeight: 700, color: section.accent, margin: "16px 0 5px", fontSize: 14 }}>{b.text}</p>;
        if (b.type === "bullet")
          return (
            <div key={i} style={{ display: "flex", gap: 7, margin: "3px 0", alignItems: "flex-start" }}>
              <span style={{ color: section.accent, flexShrink: 0, marginTop: 4, fontSize: 11 }}>▸</span>
              <span style={{ color: "#94a3b8", fontSize: 13.5, lineHeight: 1.7 }}>{renderInline(b.text)}</span>
            </div>
          );
        if (b.type === "table")
          return (
            <div key={i} style={{ overflowX: "auto", margin: "12px 0" }}>
              <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
                {b.rows.map((row, ri) => (
                  <tr key={ri} style={{ borderBottom: "1px solid #1e293b" }}>
                    {row.map((cell, ci) => (
                      <td key={ci} style={{ padding: "7px 11px", color: ri === 0 ? "#f1f5f9" : "#94a3b8", fontWeight: ri === 0 ? 700 : 400, background: ri === 0 ? "#0f172a" : "transparent", fontFamily: ri === 0 ? "inherit" : "monospace", fontSize: ri === 0 ? 13 : 12 }}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </table>
            </div>
          );
        return (
          <p key={i} style={{ color: "#94a3b8", fontSize: 13.5, lineHeight: 1.8, margin: "5px 0" }}>
            {renderInline(b.text)}
          </p>
        );
      })}
    </div>
  );
}

export default function JavaLearningPortal() {
  const [activeSection, setActiveSection] = useState("core-java");
  const [activeTopic, setActiveTopic] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const section = curriculum.find(s => s.id === activeSection);
  const topic = section?.topics[activeTopic];

  const filteredTopics = searchQuery.trim()
    ? curriculum.flatMap(s =>
        s.topics
          .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
          .map(t => ({ ...t, sectionId: s.id, sectionTitle: s.title }))
      )
    : [];

  return (
    <div style={{ height: "100vh", background: "#020817", color: "#f1f5f9", fontFamily: "system-ui, sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#0f172a,#1e1b4b)", borderBottom: "1px solid #1e293b", padding: "11px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>☕</span>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, background: "linear-gradient(90deg,#f59e0b,#6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Java Mastery Hub
            </div>
            <div style={{ fontSize: 9, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Core Java · Spring Boot · Microservices
            </div>
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "#64748b", fontSize: 12 }}>🔍</span>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search topics..."
            style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 7, padding: "6px 10px 6px 26px", color: "#f1f5f9", fontSize: 12, width: 190, outline: "none" }}
          />
        </div>
      </div>

      {/* Search results */}
      {searchQuery && (
        <div style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "8px 14px", flexShrink: 0 }}>
          {filteredTopics.length === 0
            ? <span style={{ color: "#64748b", fontSize: 12 }}>No results</span>
            : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {filteredTopics.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const s = curriculum.find(x => x.id === t.sectionId);
                      setActiveSection(t.sectionId);
                      setActiveTopic(s.topics.findIndex(x => x.title === t.title));
                      setSearchQuery("");
                    }}
                    style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 7, padding: "5px 10px", cursor: "pointer", color: "#f1f5f9", fontSize: 11 }}
                  >
                    <span style={{ color: "#64748b", marginRight: 5 }}>{t.sectionTitle}</span>{t.title}
                  </button>
                ))}
              </div>
            )
          }
        </div>
      )}

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Section icon sidebar */}
        <div style={{ width: 60, background: "#0f172a", borderRight: "1px solid #1e293b", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 10, gap: 4, flexShrink: 0 }}>
          {curriculum.map(s => (
            <button
              key={s.id}
              onClick={() => { setActiveSection(s.id); setActiveTopic(0); }}
              title={s.title}
              style={{ width: 44, height: 44, borderRadius: 9, border: "none", cursor: "pointer", fontSize: 19, background: activeSection === s.id ? s.color + "22" : "transparent", outline: activeSection === s.id ? "2px solid " + s.color : "none" }}
            >
              {s.icon}
            </button>
          ))}
        </div>

        {/* Topic list */}
        <div style={{ width: 230, background: "#0a0f1e", borderRight: "1px solid #1e293b", overflowY: "auto", flexShrink: 0 }}>
          <div style={{ padding: "11px 12px", borderBottom: "1px solid #1e293b" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontSize: 16 }}>{section?.icon}</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: section?.accent }}>{section?.title}</span>
            </div>
            <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>{section?.topics.length} topics</div>
          </div>
          <div style={{ padding: "6px" }}>
            {section?.topics.map((t, i) => {
              const lc = levelColors[t.level];
              return (
                <button
                  key={i}
                  onClick={() => setActiveTopic(i)}
                  style={{ width: "100%", textAlign: "left", padding: "9px 9px", borderRadius: 7, background: activeTopic === i ? section.color + "18" : "transparent", border: activeTopic === i ? "1px solid " + section.color + "44" : "1px solid transparent", cursor: "pointer", marginBottom: 2 }}
                >
                  <div style={{ fontSize: 12, color: activeTopic === i ? "#f1f5f9" : "#94a3b8", fontWeight: activeTopic === i ? 600 : 400, lineHeight: 1.4, marginBottom: 4 }}>{t.title}</div>
                  <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 99, background: lc.bg, color: lc.text, fontWeight: 700 }}>{t.level}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "22px 26px" }}>
          {topic && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: "#64748b" }}>{section?.title}</span>
                    <span style={{ color: "#334155" }}>›</span>
                    <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 99, background: levelColors[topic.level]?.bg, color: levelColors[topic.level]?.text, fontWeight: 700 }}>{topic.level}</span>
                  </div>
                  <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#f8fafc" }}>{topic.title}</h1>
                </div>
                <div style={{ display: "flex", gap: 7 }}>
                  <button
                    onClick={() => setActiveTopic(Math.max(0, activeTopic - 1))}
                    disabled={activeTopic === 0}
                    style={{ padding: "6px 13px", background: "#1e293b", border: "1px solid #334155", borderRadius: 7, color: activeTopic === 0 ? "#334155" : "#94a3b8", cursor: activeTopic === 0 ? "not-allowed" : "pointer", fontSize: 12 }}
                  >← Prev</button>
                  <button
                    onClick={() => setActiveTopic(Math.min((section?.topics.length || 1) - 1, activeTopic + 1))}
                    disabled={activeTopic === (section?.topics.length || 1) - 1}
                    style={{ padding: "6px 13px", background: section?.color + "22", border: "1px solid " + section?.color + "44", borderRadius: 7, color: section?.accent, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                  >Next →</button>
                </div>
              </div>

              <div style={{ borderTop: "2px solid " + section?.color, paddingTop: 18 }}>
                <TopicView topic={topic} section={section} />
              </div>

              <div style={{ marginTop: 28, padding: "14px", background: "#0f172a", borderRadius: 9, border: "1px solid #1e293b" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 10, color: "#64748b" }}>Section Progress</span>
                  <span style={{ fontSize: 10, color: section?.accent }}>{activeTopic + 1} / {section?.topics.length}</span>
                </div>
                <div style={{ height: 3, background: "#1e293b", borderRadius: 99 }}>
                  <div style={{
                    height: "100%",
                    width: ((activeTopic + 1) / (section?.topics.length || 1) * 100) + "%",
                    background: "linear-gradient(90deg," + section?.color + "," + section?.accent + ")",
                    borderRadius: 99,
                    transition: "width 0.3s"
                  }} />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right quick-nav */}
        <div style={{ width: 170, background: "#0a0f1e", borderLeft: "1px solid #1e293b", padding: "12px 9px", overflowY: "auto", flexShrink: 0 }}>
          <div style={{ fontSize: 9, color: "#475569", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>All Sections</div>
          {curriculum.map(s => (
            <div key={s.id}>
              <button
                onClick={() => { setActiveSection(s.id); setActiveTopic(0); }}
                style={{ width: "100%", textAlign: "left", padding: "4px 7px", borderRadius: 5, background: activeSection === s.id ? s.color + "15" : "transparent", border: "none", cursor: "pointer", color: activeSection === s.id ? s.accent : "#64748b", fontSize: 12, fontWeight: activeSection === s.id ? 700 : 400 }}
              >
                {s.icon} {s.title}
              </button>
              {activeSection === s.id && s.topics.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTopic(i)}
                  style={{ width: "100%", textAlign: "left", padding: "2px 7px 2px 20px", border: "none", background: "transparent", cursor: "pointer", color: activeTopic === i ? "#f1f5f9" : "#475569", fontSize: 10, borderLeft: activeTopic === i ? "2px solid " + s.color : "2px solid transparent" }}
                >
                  {t.title.length > 20 ? t.title.slice(0, 20) + "…" : t.title}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
