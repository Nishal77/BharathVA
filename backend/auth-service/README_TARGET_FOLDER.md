# Understanding the `target` Folder

## What is the `target` folder?

The `target` folder is **Maven's build output directory**. It's automatically created when you build the project with Maven.

### Contents of `target` folder:
```
target/
├── classes/                    # Compiled .class files
├── generated-sources/          # Auto-generated code (like Lombok)
├── maven-status/              # Maven build metadata
├── test-classes/              # Compiled test files
├── auth-service-1.0.0.jar     # Final packaged JAR file
└── auth-service-1.0.0.jar.original  # Original JAR before repackaging
```

## Why was it removed?

1. **Generated automatically**: Maven recreates it every build
2. **Not source code**: Should never be committed to Git
3. **Large size**: Contains all compiled files and dependencies
4. **Build artifacts**: Changes with every compilation

## What happens after removal?

✅ **Nothing breaks!** Maven will recreate it when you run:
```bash
mvn clean install
# or
mvn spring-boot:run
```

## Best Practices

### ✅ DO:
- Add `target/` to `.gitignore` (already done)
- Delete `target` when you have build issues: `mvn clean`
- Let Maven manage the `target` folder

### ❌ DON'T:
- Commit `target/` to Git
- Manually edit files in `target/`
- Rely on files in `target/` - they're temporary

## Build Commands

### Clean and rebuild (removes target)
```bash
mvn clean install
```

### Just clean (removes target)
```bash
mvn clean
```

### Package without tests (creates target)
```bash
mvn package -DskipTests
```

### Run without creating JAR (creates target/classes only)
```bash
mvn spring-boot:run
```

## Summary

**`target/` = Build Output = Temporary = Safe to Delete**

The actual source code is in:
- `src/main/java/` - Your Java code
- `src/main/resources/` - Configuration files
- `src/test/java/` - Test code (now created)

---

**Note:** The `target` folder has been removed and added to `.gitignore`. It will be automatically recreated when you build or run the project.

