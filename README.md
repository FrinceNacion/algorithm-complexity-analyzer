# Algorithm Complexity Analyzer (Web-Based)

## Project Title
Web-Based Algorithm Complexity Analyzer Using JavaScript and PHP for College-Level Algorithm Education

---

## Project Overview
This project is a web-based system designed to compute and analyze the time and space complexity of selected algorithms. It is intended to support college-level instruction in algorithm analysis by providing both theoretical and empirical insights.

The system allows users to select algorithms, input problem sizes, execute implementations in JavaScript, and observe measured runtime alongside theoretical complexity classifications. Results are stored and can be visualized through graphs for comparative analysis.

---

## Objectives
- Apply theoretical complexity analysis (Big-O, Big-Theta, Big-Omega)
- Implement algorithms using JavaScript
- Measure empirical runtime behavior
- Compare empirical and theoretical results
- Store and retrieve execution data using a database
- Visualize algorithm efficiency through graphs

---

## Scope of the System

### Supported Algorithms
- Bubble Sort — Time: O(n²), Space: O(1)
- Merge Sort — Time: O(n log n), Space: O(n)
- Binary Search — Time: O(log n), Space: O(1)
- Linear Search — Time: O(n), Space: O(1)
- Fibonacci (Recursive) — Time: O(2ⁿ), Space: O(n)
- Fibonacci (Dynamic Programming) — Time: O(n), Space: O(n)

---

## System Architecture

### Frontend
- HTML, CSS, JavaScript
- Handles user interaction, input configuration, and visualization

### Backend
- PHP
- Processes requests and manages data storage

### Database
- MySQL
- Stores execution results and input configurations

---

## Key Features
- Algorithm selection interface
- Input size configuration
- Runtime measurement using high-resolution timing
- Complexity classification (time and space)
- Graph-based visualization of results
- Persistent data storage

---

## Development Roadmap

### Phase 1: Planning
- Define system scope and requirements
- Assign roles and responsibilities

### Phase 2: System Design
- Design user interface
- Plan database schema
- Define API endpoints

### Phase 3: Core Development
- Implement frontend components
- Develop backend services
- Implement algorithms and runtime measurement

### Phase 4: Integration
- Connect frontend and backend systems
- Ensure proper data flow

### Phase 5: Testing
- Validate algorithm correctness
- Verify runtime measurements
- Handle edge cases

### Phase 6: Visualization
- Implement graphing features
- Improve usability and clarity

### Phase 7: Documentation and Presentation
- Prepare written documentation
- Develop presentation materials

---

## Team Roles and Responsibilities

### Project Manager
- Oversees project timeline and coordination
- Ensures milestones are met

### System Analyst
- Defines system requirements and architecture
- Ensures alignment with theoretical concepts

### Frontend Developer
- Develops user interface
- Implements visualization features

### Backend Developer
- Builds API endpoints
- Handles server-side logic and database interaction

### Database Manager
- Designs and maintains database schema
- Ensures data integrity

### Quality Assurance Tester
- Tests system functionality
- Identifies bugs and inconsistencies

### Documentation Lead
- Prepares technical documentation
- Ensures clarity and completeness

---

## Presentation Guidelines
Duration: 10–15 minutes

Sections:
1. Introduction
2. Problem Statement
3. System Architecture
4. Algorithm Demonstration
5. Complexity Analysis
6. Live Demonstration
7. Conclusion

---

## Evaluation Criteria

| Category | Points |
|----------|--------|
| Functionality | 30 |
| System Design | 20 |
| Complexity Analysis | 25 |
| Code Quality | 15 |
| Presentation | 10 |
| **Total** | **100** |

---

## Notes and Limitations
- Runtime results may vary depending on hardware and browser environment
- Complexity classification is based on predefined mappings
- Large input sizes may affect responsiveness

---

## Future Improvements
- Additional algorithm support
- Step-by-step execution visualization
- Multi-language implementation support
- Advanced static analysis capabilities
