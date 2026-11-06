---
name: be-module
description: Cum se adaugă sau se extinde un feature în backend-ul AradEx-Backend (api = contract: interfață + DTO-uri + enum-uri; app = migrare, entity, repository, service, mapper static, controller, teste cu mock/ și JSON din resources), în ordinea și cu șabloanele proiectului. Folosește-l pentru orice endpoint sau tabel nou.
---

# Feature nou / extindere în `AradEx-Backend`

Căile de cod sunt relative la rădăcina repo-ului `AradEx-Backend` (sau a worktree-ului tău `../_wt/AradEx-Backend-Txx`); documentele sunt în `AradEx-Plan/docs/`. Citește `AradEx-Backend/CLAUDE.md`, secțiunea feature-ului din `AradEx-Plan/docs/API.md`, tabelul din `AradEx-Plan/docs/DATA-MODEL.md` (lucrezi doar în feature-urile story-ului tău). Un feature `<f>` (ex. `events`) atinge:
`api/src/main/java/aradexperience/{api/<F>Api, dto/<f>/*, enums/*}` și `app/src/main/java/aradexperience/{entity,repository,service,mapper,controller}/<f>/` + migrarea + testele.

## Ordinea
1. **Migrare** `app/src/main/resources/db/migration/V{n}__{f}.sql` (numărul următor liber, în ordinea story-urilor din PLAN). Doar DDL + indexuri. Seed separat `V{n}_1__seed_{f}.sql` (skill `seed-data`).
2. **Entity** `entity/<f>/X.java` (Lombok `@Getter @Setter @NoArgsConstructor`, `@Entity @Table`, id `IDENTITY`, enum-uri `@Enumerated(STRING)` — enum-ul din `api/enums`, timpi `OffsetDateTime`). FK-uri simple ca `Long businessId` când nu ai nevoie de obiect.
3. **Repository** `repository/<f>/XRepository extends JpaRepository<X, Long>` (+ `JpaSpecificationExecutor` pentru filtre).
4. **DTO-uri** în `api/…/dto/<f>/`: `XDto`, `XSummary` (răspuns), `XCreate`/`XRequest` (cerere, validări jakarta). Record-uri; numele câmpurilor = exact `API.md`. Enum-uri noi în `api/…/enums/`.
5. **Interfața** `api/…/api/<F>Api`: `@Tag`, `@RequestMapping("/api/v1/…")` pe tip; pe metode `@GetMapping`/`@PostMapping` + `@Operation`, `@ResponseStatus(CREATED)` la creare, `@Valid @RequestBody`, `@PathVariable`, `@RequestParam`. Fără tipuri din `app`.
6. **Mapper** `mapper/<f>/XMapper` — clasă utilitară adnotată cu `@UtilityClass` (Lombok): `toDto`, `toSummary`, `toEntity`. Câmpurile calculate vin ca parametri (`toSummary(ev, distanceKm, saved)`). Se folosește cu `import static`.
7. **Service** `service/<f>/XService`: `@Service @RequiredArgsConstructor @Transactional(readOnly = true)`; metodele care scriu au `@Transactional`. Aici stau regulile (capacitate, idempotență, proprietar). Primește `CurrentUser` ca parametru. Aruncă excepțiile din `aradexperience.exceptions`.
8. **Controller** `controller/<f>/XController implements <F>Api` (`@RestController @RequiredArgsConstructor`): `AuthContext.require()` → service → mapper. Zero logică.
9. **Security**: `config/SecurityConfig` e al lui P1 și are din T03 regulile pentru toate rutele din API.md (`/business/**` BUSINESS, `/city/**` CITY_HALL, `/admin/**` ADMIN, GET-urile publice). Dacă ruta ta nu e acoperită, cere-i lui P1 regula — nu o adăuga tu.
10. **Teste**: `api`: JSON + test de serializare pentru DTO-urile noi (`src/test/resources/dto/<f>/x.json`, șablon `UserDtoTest`), un caz în `DtoValidationTest` pentru cereri cu reguli; `app`: `mock/<F>Mock` (date de test: entități + DTO-uri), `service/<f>/XServiceTest` (Mockito) pentru fiecare regulă din „Verificare”, `controller/<f>/XControllerTest` (șablon `HealthControllerTest`, cererea din `src/test/resources/requests/<f>/*.json`).
11. `./gradlew test`, apoi `./gradlew :app:bootRun` și verifică în Swagger cererea reală, inclusiv erorile (400/401/403/404/409).

## Șabloane

```java
// api/…/dto/tickets/TicketRequest.java
public record TicketRequest(@Min(0) int qtyAdult, @Min(0) int qtyChild, @Email @NotBlank String email) {}
```

```java
// api/…/api/TicketsApi.java
@Tag(name = "Tickets") @RequestMapping("/api/v1")
public interface TicketsApi {
  @Operation(summary = "Cumpără bilete; 409 capacity, 400 dacă evenimentul e EXTERNAL")
  @PostMapping("/events/{id}/tickets") @ResponseStatus(HttpStatus.CREATED)
  TicketDto buy(@PathVariable long id, @Valid @RequestBody TicketRequest request);
}
```

```java
// app/…/mapper/tickets/TicketMapper.java
@lombok.experimental.UtilityClass
public final class TicketMapper {
  private TicketMapper() {}
  public static TicketDto toDto(Ticket t) { return new TicketDto(t.getId(), t.getCode(), t.getEventId(), t.getQtyAdult(), t.getQtyChild(), t.getStatus(), t.getCreatedAt()); }
  public static Ticket toEntity(TicketRequest req, Event ev, long userId) { Ticket t = new Ticket(); /* set fields */ return t; }
}
```

```java
// app/…/service/tickets/TicketService.java
import static aradexperience.mapper.tickets.TicketMapper.toEntity;

@Transactional
public Ticket buy(long eventId, CurrentUser user, TicketRequest req) {
    Event ev = events.findById(eventId).orElseThrow(() -> NotFoundException.of("Event", eventId));
    if (ev.getTicketType() == TicketType.EXTERNAL) throw new BadRequestException("Tickets are sold on the organizer's site");
    int qty = req.qtyAdult() + req.qtyChild();
    if (ev.getCapacity() != null && ev.getParticipantsCount() + qty > ev.getCapacity()) throw new ConflictException("capacity");
    Ticket t = toEntity(req, ev, user.id()); t.setCode(Codes.generate("AX-T" + eventId));
    ev.setParticipantsCount(ev.getParticipantsCount() + qty);
    return tickets.save(t);
}
```

```java
// app/…/controller/tickets/TicketController.java
import static aradexperience.mapper.tickets.TicketMapper.toDto;

@RestController @RequiredArgsConstructor
public class TicketController implements TicketsApi {
  private final TicketService service;
  @Override public TicketDto buy(long id, TicketRequest request) { return toDto(service.buy(id, AuthContext.require(), request)); }
}
```

```java
// app/src/test/…/mock/TicketMock.java — datele de test, refolosite de ServiceTest și ControllerTest
public final class TicketMock {
  private TicketMock() {}
  public static Event event(int capacity, int participants) { Event e = new Event(); e.setId(1L); e.setCapacity(capacity); e.setParticipantsCount(participants); e.setTicketType(TicketType.IN_APP); return e; }
  public static Ticket ticket(String code) { Ticket t = new Ticket(); t.setId(10L); t.setCode(code); t.setEventId(1L); t.setQtyAdult(1); t.setStatus(TicketStatus.VALID); return t; }
  public static CurrentUser local() { return new CurrentUser(7L, "local@demo.ro", Role.LOCAL); }
}
```

```java
// app/src/test/…/controller/tickets/TicketControllerTest.java  (cererea în src/test/resources/requests/tickets/buy.json)
@ControllerTest(TicketController.class)   // = @WebMvcTest + SecurityConfig real + JwtService mock (vezi controller/ControllerTest)
class TicketControllerTest {
  @Autowired MockMvc mvc;
  @MockBean TicketService service;
  @Test void buy_returns201() throws Exception {
    when(service.buy(eq(1L), any(), any())).thenReturn(TicketMock.ticket("AX-T1-ABC123"));
    mvc.perform(post("/api/v1/events/1/tickets").with(AuthMock.as(7L, Role.LOCAL))
          .contentType(MediaType.APPLICATION_JSON).content(JsonFixtures.read("requests/tickets/buy.json")))
       .andExpect(status().isCreated()).andExpect(jsonPath("$.code").value("AX-T1-ABC123"));
  }
  @Test void buy_withoutToken_is401() throws Exception {
    mvc.perform(post("/api/v1/events/1/tickets").contentType(MediaType.APPLICATION_JSON).content("{}")).andExpect(status().isUnauthorized());
  }
}
```

```java
// app/src/test/…/service/tickets/TicketServiceTest.java
@ExtendWith(MockitoExtension.class)
class TicketServiceTest {
  @Mock EventRepository events; @Mock TicketRepository tickets; @InjectMocks TicketService service;
  @Test void buy_overCapacity_throws409() {
    when(events.findById(1L)).thenReturn(Optional.of(TicketMock.event(10, 9)));
    assertThatThrownBy(() -> service.buy(1L, TicketMock.local(), new TicketRequest(2, 0, "a@b.ro"))).isInstanceOf(ConflictException.class);
  }
}
```

## Capcane
- Adnotările de web stau pe interfață; nu le repeta pe controller. Parametrii din implementare au aceeași ordine/tipuri ca în interfață (numele nu contează).
- Mapper-ele sunt statice: în teste nu se mock-uiesc; dacă un mapper „are nevoie” de un repository, logica aia e de service.
- `near` + `radiusKm`: haversine în SQL sau în memorie dacă lista e mică; întoarce `distanceKm` în DTO.
- Idempotență: confirmarea unei înscrieri / folosirea unui cod a doua oară nu modifică nimic (200 cu flag sau 409, conform API.md).
- Nu expune entități; paginează listele publice (`Pages.of`); `fetch = LAZY` implicit.
- Orice scriere de puncte trece prin `PointsService`.
- Un DTO nou din `api` apare în FE în `src/shared/types/api.ts` în același PR (sau îl anunți).
