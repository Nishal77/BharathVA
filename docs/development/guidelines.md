# Development Guidelines

## Code Style and Standards

### General Principles
- Write clean, readable, and maintainable code
- Follow SOLID principles
- Use meaningful variable and function names
- Keep functions small and focused
- Avoid code duplication (DRY principle)
- Write self-documenting code with clear intent

### Java Code Standards

#### Naming Conventions
- **Classes**: PascalCase (e.g., `AuthenticationService`)
- **Methods**: camelCase (e.g., `getUserProfile`)
- **Variables**: camelCase (e.g., `userId`, `emailAddress`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_LOGIN_ATTEMPTS`)
- **Packages**: lowercase (e.g., `com.bharathva.auth.service`)

#### Code Organization
```java
// 1. Package declaration
package com.bharathva.auth.service;

// 2. Imports (grouped and organized)
import java.util.*;
import org.springframework.*;
import com.bharathva.*;

// 3. Class-level documentation
/**
 * Service for handling user authentication operations.
 */
@Service
public class AuthenticationService {
    
    // 4. Constants
    private static final int MAX_ATTEMPTS = 5;
    
    // 5. Dependencies (autowired fields)
    @Autowired
    private UserRepository userRepository;
    
    // 6. Public methods
    public LoginResponse login(LoginRequest request) {
        // Implementation
    }
    
    // 7. Private helper methods
    private void validateCredentials(String email, String password) {
        // Implementation
    }
}
```

#### Method Structure
```java
public ReturnType methodName(ParameterType parameter) {
    // 1. Input validation
    if (parameter == null) {
        throw new IllegalArgumentException("Parameter cannot be null");
    }
    
    // 2. Business logic
    Result result = performOperation(parameter);
    
    // 3. Return result
    return result;
}
```

### TypeScript/JavaScript Standards

#### Naming Conventions
- **Interfaces**: PascalCase with descriptive names (e.g., `UserProfile`)
- **Functions**: camelCase (e.g., `fetchUserProfile`)
- **Variables**: camelCase (e.g., `accessToken`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_TIMEOUT`)
- **Components**: PascalCase (e.g., `ProfileUsername`)

#### Code Organization
```typescript
// 1. Imports
import React from 'react';
import { View, Text } from 'react-native';

// 2. Type definitions
interface ProfileProps {
  userId: string;
  username: string;
}

// 3. Constants
const DEFAULT_AVATAR = 'https://...';

// 4. Component
export default function ProfileUsername({ userId, username }: ProfileProps) {
  // 5. Hooks
  const [loading, setLoading] = useState(false);
  
  // 6. Effects
  useEffect(() => {
    // Implementation
  }, []);
  
  // 7. Handlers
  const handlePress = () => {
    // Implementation
  };
  
  // 8. Render
  return (
    <View>
      <Text>{username}</Text>
    </View>
  );
}
```

#### Function Structure
```typescript
async function fetchUserProfile(userId: string): Promise<UserProfile> {
  // 1. Validation
  if (!userId) {
    throw new Error('User ID is required');
  }
  
  // 2. API call
  const response = await apiCall<UserProfile>(`/users/${userId}`, 'GET');
  
  // 3. Error handling
  if (!response.success) {
    throw new Error(response.message);
  }
  
  // 4. Return data
  return response.data;
}
```

## Error Handling

### Backend Error Handling

#### Exception Hierarchy
```java
// Business logic errors
public class BusinessException extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }
}

// Resource not found
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}

// Authentication errors
public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException(String message) {
        super(message);
    }
}
```

#### Global Exception Handler
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException ex) {
        return ResponseEntity
            .badRequest()
            .body(ApiResponse.error(ex.getMessage()));
    }
    
    // Additional handlers...
}
```

### Frontend Error Handling

#### Error Types
```typescript
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

#### Error Handling Pattern
```typescript
try {
  const result = await apiCall('/endpoint', 'POST', data);
  return result;
} catch (error) {
  if (error instanceof ApiError) {
    // Handle API errors
    if (error.statusCode === 401) {
      // Handle authentication error
    } else if (error.statusCode === 400) {
      // Handle validation error
    }
  } else {
    // Handle unexpected errors
    console.error('Unexpected error:', error);
  }
  throw error;
}
```

## Logging Standards

### Backend Logging

#### Log Levels
- **ERROR**: System errors requiring immediate attention
- **WARN**: Potentially harmful situations
- **INFO**: Important business process information
- **DEBUG**: Detailed debugging information

#### Logging Best Practices
```java
private static final Logger log = LoggerFactory.getLogger(AuthenticationService.class);

// ERROR: System failures
log.error("Failed to connect to database: {}", e.getMessage());

// WARN: Business rule violations
log.warn("Login attempt for unverified email: {}", email);

// INFO: Business events
log.info("User registered successfully: {}", username);

// DEBUG: Detailed information
log.debug("Processing request for user: {}", userId);
```

#### What NOT to Log
- Passwords (plain or hashed)
- Full access tokens or refresh tokens
- Personal identification numbers
- Credit card information
- Other sensitive data

### Frontend Logging

#### Development Logging
```typescript
// Use only during development
if (__DEV__) {
  console.log('Debug info:', data);
}
```

#### Production Logging
```typescript
// Use structured logging service
logger.info('User logged in', { userId, timestamp });
logger.error('API call failed', { endpoint, error });
```

## Testing Standards

### Backend Testing

#### Unit Tests
```java
@Test
void shouldAuthenticateValidUser() {
    // Arrange
    LoginRequest request = new LoginRequest("user@example.com", "password");
    when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
    
    // Act
    LoginResponse response = authenticationService.login(request, "127.0.0.1", "device");
    
    // Assert
    assertNotNull(response.getAccessToken());
    assertEquals(user.getEmail(), response.getEmail());
}
```

#### Integration Tests
```java
@SpringBootTest
@AutoConfigureMockMvc
class AuthenticationControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void shouldRegisterNewUser() throws Exception {
        mockMvc.perform(post("/auth/register/email")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"test@example.com\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
```

### Frontend Testing

#### Component Tests
```typescript
import { render, screen } from '@testing-library/react-native';

describe('ProfileUsername', () => {
  it('displays full name when available', () => {
    const user = { fullName: 'Nishal Poojary', username: 'nishalp' };
    render(<ProfileUsername user={user} />);
    expect(screen.getByText('Nishal Poojary')).toBeTruthy();
  });
});
```

## Git Workflow

### Branch Naming
- **feature/**: New features (e.g., `feature/user-profile`)
- **fix/**: Bug fixes (e.g., `fix/login-validation`)
- **refactor/**: Code refactoring (e.g., `refactor/auth-service`)
- **docs/**: Documentation updates (e.g., `docs/api-documentation`)
- **chore/**: Maintenance tasks (e.g., `chore/update-dependencies`)

### Commit Messages
Follow conventional commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:
```
feat(auth): implement JWT refresh token mechanism

fix(mobile): resolve fullName display issue in profile component

docs(api): update authentication endpoint documentation

refactor(auth): improve error handling in login service

test(auth): add integration tests for registration flow
```

### Pull Request Process
1. Create feature branch from `main`
2. Implement changes with tests
3. Ensure all tests pass
4. Update documentation if needed
5. Create pull request with clear description
6. Address review comments
7. Squash commits if needed
8. Merge to main after approval

## Code Review Checklist

### General
- [ ] Code follows project style guidelines
- [ ] No console.log or print statements in production code
- [ ] Error handling implemented properly
- [ ] No hardcoded credentials or secrets
- [ ] Comments explain complex logic

### Backend
- [ ] Input validation on all endpoints
- [ ] Proper exception handling
- [ ] Database transactions where needed
- [ ] Indexes created for new queries
- [ ] Logging at appropriate levels
- [ ] Tests written and passing

### Frontend
- [ ] TypeScript types properly defined
- [ ] Loading and error states handled
- [ ] API errors handled gracefully
- [ ] Accessibility considered
- [ ] Performance optimized
- [ ] No memory leaks

## Documentation Standards

### Code Documentation
```java
/**
 * Authenticates user and creates a new session.
 * 
 * @param loginRequest Contains user credentials
 * @param ipAddress Client IP address for session tracking
 * @param deviceInfo Device information for session identification
 * @return LoginResponse containing access and refresh tokens
 * @throws InvalidCredentialsException if credentials are incorrect
 * @throws BusinessException if email is not verified
 */
public LoginResponse login(LoginRequest loginRequest, String ipAddress, String deviceInfo) {
    // Implementation
}
```

### API Documentation
- Document all endpoints
- Include request/response examples
- Specify error codes and messages
- Document authentication requirements
- Provide usage examples

## Performance Guidelines

### Backend Performance
- Use database indexes effectively
- Implement connection pooling
- Avoid N+1 query problems
- Use pagination for large datasets
- Implement caching where appropriate
- Monitor slow queries

### Frontend Performance
- Minimize API calls
- Implement efficient state management
- Use memoization for expensive calculations
- Optimize re-renders
- Lazy load components
- Cache static data

## Security Guidelines

### Input Validation
- Validate all user input
- Sanitize data before processing
- Use parameterized queries
- Implement rate limiting
- Validate file uploads

### Authentication
- Never log passwords or tokens
- Use secure password hashing
- Implement session timeout
- Validate tokens on every request
- Support multi-factor authentication

### Data Protection
- Encrypt sensitive data at rest
- Use HTTPS for all communications
- Implement CORS properly
- Protect against XSS and CSRF
- Regular security audits

## Dependency Management

### Backend Dependencies
- Keep dependencies up to date
- Review security vulnerabilities
- Use dependency management tools
- Lock versions in production
- Audit third-party libraries

### Frontend Dependencies
- Use npm audit regularly
- Keep React Native updated
- Review package licenses
- Minimize dependency count
- Use established, maintained packages

## Continuous Improvement

### Code Quality
- Regular code reviews
- Refactoring when needed
- Technical debt tracking
- Performance profiling
- Security scanning

### Learning and Growth
- Stay updated with technology trends
- Share knowledge with team
- Document lessons learned
- Contribute to open source
- Attend tech conferences

## Tools and Resources

### Development Tools
- IDE: IntelliJ IDEA, VS Code
- API Testing: Postman, Insomnia
- Database: DBeaver, pgAdmin
- Version Control: Git
- CI/CD: GitHub Actions, Jenkins

### Code Quality Tools
- SonarQube for code analysis
- ESLint for JavaScript/TypeScript
- Checkstyle for Java
- JaCoCo for test coverage
- OWASP Dependency Check

## Additional Resources
- [Local Development Setup](../setup/local-development.md)
- [API Documentation](../api/authentication.md)
- [Database Schema](../architecture/database-schema.md)
- [Docker Setup](../setup/docker-setup.md)

