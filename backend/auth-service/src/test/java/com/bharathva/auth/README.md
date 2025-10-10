# Auth Service Tests

This folder contains all test cases for the Auth Service.

## Test Structure

```
test/
├── java/com/bharathva/auth/
│   ├── controller/
│   │   └── RegistrationControllerTest.java    # Integration tests for API endpoints
│   ├── service/
│   │   ├── RegistrationServiceTest.java       # Unit tests for registration logic
│   │   └── EmailServiceTest.java              # Unit tests for email sending
│   └── repository/
│       └── UserRepositoryTest.java            # Unit tests for data access
└── resources/
    └── application-test.yml                   # Test configuration
```

## Running Tests

### Run all tests
```bash
cd auth-service
mvn test
```

### Run specific test class
```bash
mvn test -Dtest=RegistrationServiceTest
```

### Run specific test method
```bash
mvn test -Dtest=RegistrationServiceTest#testEmailRegistration
```

### Run with coverage
```bash
mvn clean test jacoco:report
```

## Test Configuration

Tests use:
- **H2 Database**: In-memory database for testing
- **Mock SMTP**: No real emails sent during tests
- **Random Port**: To avoid conflicts

## Writing Tests

### Unit Test Example
```java
@Test
public void testEmailRegistration() {
    // Arrange
    RegisterEmailRequest request = new RegisterEmailRequest();
    request.setEmail("test@example.com");
    
    // Act
    RegistrationResponse response = registrationService.registerEmail(request);
    
    // Assert
    assertNotNull(response.getSessionToken());
    assertEquals("OTP", response.getCurrentStep());
}
```

### Integration Test Example
```java
@Test
public void testRegisterEmailEndpoint() throws Exception {
    mockMvc.perform(post("/auth/register/email")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"email\":\"test@example.com\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));
}
```

## Test Coverage Goals

- Unit Tests: 80%+ coverage
- Integration Tests: All critical paths
- Edge Cases: Error handling, validation

## TODO

- [ ] Add comprehensive unit tests
- [ ] Add integration tests for all endpoints
- [ ] Add performance tests
- [ ] Add security tests
- [ ] Set up test coverage reporting

