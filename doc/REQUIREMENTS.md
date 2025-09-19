# ResourceCalc Portal - Formal Requirements Specification

## Document Information
- **Document Type**: Software Requirements Specification (SRS)
- **Version**: 2.0.0
- **Date**: September 19, 2025
- **Status**: ✅ **IMPLEMENTED** - Production deployment active
- **Repository**: https://github.com/zouhao790930/ResourceCalc001
- **Live System**: https://zouhao790930.github.io/ResourceCalc001/
- **Last Updated**: September 19, 2025

## 1. Introduction

### 1.1 Purpose
This document specifies the functional and non-functional requirements for ResourceCalc Portal, a web-based CPU resource estimation tool for Microsoft Copilot service capacity planning. The system enables engineers, capacity planners, and analysts to estimate CPU core requirements across different experimental and operational scenarios.

### 1.2 Scope
ResourceCalc Portal is a single-page web application that:
- Provides interactive CPU estimation for four distinct scenarios
- Offers dual input modes for flexibility (detailed parameters vs. direct QPS)
- Uses real performance coefficients extracted from production monitoring data
- Displays comprehensive calculation explanations for transparency
- Supports capacity planning across XAP, LSS, CSO, and Store service components

### 1.3 Definitions and Acronyms
- **QPS**: Queries Per Second
- **RPS**: Requests Per Second  
- **CPU Cores**: Computational processing units required
- **XAP**: eXtended Application Platform
- **LSS**: Large Scale Storage
- **CSO**: Compute Storage Optimization
- **Store**: Storage Service
- **MAU**: Monthly Active Users
- **DAU**: Daily Active Users
- **QPD**: Queries Per DAU per Day
- **PCF**: Peak Concurrency Factor

### 1.4 References
- BizChat Monitoring Dashboard (source of performance coefficients)
- GitHub Pages Deployment: https://zouhao790930.github.io/ResourceCalc001/
- Design Document: `doc/DESIGN.md`

## 2. Overall Description

### 2.1 Product Perspective
ResourceCalc Portal is a standalone web application deployed via GitHub Pages. It operates entirely client-side with no backend dependencies, making it suitable for internal capacity planning use cases within Microsoft's development environment.

### 2.2 Product Functions
The system provides the following primary functions:
1. **Multi-Scenario CPU Estimation**: Support for four distinct calculation scenarios
2. **Dual Input Modes**: Flexible parameter entry (detailed vs. direct QPS)
3. **Real-Time Calculations**: Immediate updates as parameters change
4. **Calculation Transparency**: Expandable explanations of all formulas
5. **Professional UI**: Responsive design with accessibility features
6. **Production Coefficients**: Real performance data from monitoring systems

### 2.3 User Classes and Characteristics
| User Class | Characteristics | Usage Patterns |
|------------|----------------|----------------|
| **Capacity Planners** | Technical background, responsible for resource allocation | Regular use for capacity modeling and planning |
| **Software Engineers** | Deep technical knowledge, need quick estimates | Occasional use for impact analysis and sizing |
| **Product Analysts** | Business + technical knowledge, focus on growth impact | Periodic use for feature impact assessment |
| **Strategic Planners** | Business-focused, need high-level estimates | Infrequent use for long-term capacity planning |

### 2.4 Operating Environment
- **Client Platform**: Modern web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **Deployment**: GitHub Pages static hosting
- **Dependencies**: None (fully client-side application)
- **Network Requirements**: Initial page load only (no ongoing connectivity required)

## 3. Functional Requirements

### 3.1 Scenario Support Requirements

#### FR-1.1 Offline A/B Testing Scenario
**Priority**: High | **Status**: ✅ Implemented
- **Description**: Support CPU estimation for offline batch evaluation workloads
- **Input Modes**: 
  - Detailed: Queries/Month, Workdays/Month, Active Hours/Day
  - Direct: QPS input
- **Calculation**: `QPS = Queries/Month ÷ (Workdays/Month × Hours/Day × 3600)`
- **Default Values**: 1000 queries/month, 18 workdays/month, 5 hours/day

#### FR-1.2 Shadow A/B Testing Scenario
**Priority**: High | **Status**: ✅ Implemented
- **Description**: Support CPU estimation for shadow traffic duplication
- **Input Modes**:
  - Detailed: Live Baseline QPS, Fork Percentage, Fork Count
  - Direct: QPS input
- **Calculation**: `QPS = Live Baseline QPS × (Fork % ÷ 100) × Fork Count`
- **Default Values**: 2000 baseline QPS, 20% fork, 2 fork count

#### FR-1.3 Online A/B Delta Scenario
**Priority**: High | **Status**: ✅ Implemented
- **Description**: Support CPU estimation for incremental online experimental load
- **Input Modes**:
  - Detailed: Live Baseline QPS, Treatment Share, Delta Factor
  - Direct: QPS input
- **Calculation**: `QPS = Live Baseline QPS × Treatment Share × Delta Factor`
- **Default Values**: 3000 baseline QPS, 0.5 treatment share, 0.1 delta factor

#### FR-1.4 Inorganic Growth Scenario
**Priority**: High | **Status**: ✅ Implemented
- **Description**: Support CPU estimation for user growth-driven load increases
- **Input Modes**:
  - Detailed: ΔMAU, DAU/MAU Ratio, QPD, Realization Factor, PCF
  - Direct: QPS input
- **Complex Calculation**: 
  ```
  ΔDAU = ΔMAU × DAU/MAU Ratio
  Daily QPS = (ΔDAU × QPD × Realization Factor) ÷ 86400
  Peak QPS = Daily QPS × PCF
  ```
- **Default Values**: 10000 ΔMAU, 0.35 DAU/MAU ratio, 2.4 QPD, 0.85 realization factor, 6.0 PCF

### 3.2 Input Mode Requirements

#### FR-2.1 Dual Input Mode Support
**Priority**: High | **Status**: ✅ Implemented
- **Description**: Each scenario must support both detailed parameter input and direct QPS input
- **Toggle Behavior**: 
  - When enabling direct QPS: Set scenario-appropriate default QPS value
  - When disabling direct QPS: Clear QPS field and show detailed parameters
  - State must be maintained independently per scenario tab

#### FR-2.2 Parameter Validation
**Priority**: High | **Status**: ✅ Implemented
- **Description**: All numeric inputs must be validated with graceful fallbacks
- **Validation Rules**:
  - Numeric values only
  - Positive values for counts and rates
  - Range validation for ratios (0-1) with fallback to defaults
  - No system crashes on invalid input
- **Implementation**: `getValueOrDefault()` pattern ensures graceful degradation

### 3.3 Calculation Engine Requirements

#### FR-3.1 QPS Calculation
**Priority**: High | **Status**: ✅ Implemented
- **Description**: Convert scenario-specific parameters to effective QPS
- **Accuracy**: Calculations must match documented formulas exactly
- **Performance**: Single calculation < 10ms client-side

#### FR-3.2 Fanout Propagation
**Priority**: High | **Status**: ✅ Implemented
- **Description**: Apply service fanout coefficients to distribute load
- **Chain**: XAP → LSS → CSO → Store
- **Coefficients** (Real values from BizChat monitoring):
  - XAP→LSS: 2,500 requests/request
  - LSS→CSO: 4.5 requests/request
  - CSO→Store: 6.5 requests/request

#### FR-3.3 CPU Core Calculation
**Priority**: High | **Status**: ✅ Implemented
- **Description**: Convert RPS to CPU cores using service-specific coefficients
- **CPU Coefficients** (Real values from BizChat monitoring):
  - XAP: 0.00011 cores/request
  - LSS: 0.04612 cores/request
  - CSO: 0.00392 cores/request
  - Store: 0.00968 cores/request
- **Aggregation**: Total cores = sum of all service cores

### 3.4 User Interface Requirements

#### FR-4.1 Scenario Tab Interface
**Priority**: High | **Status**: ✅ Implemented
- **Description**: Tabbed interface for scenario selection
- **Accessibility**: Full keyboard navigation with ARIA labels
- **Navigation**: Arrow keys, Home/End key support

#### FR-4.2 Calculation Explanations
**Priority**: Medium | **Status**: ✅ Implemented
- **Description**: Expandable sections explaining calculation methodology
- **Content**: 
  - Parameters → QPS explanation (scenario-specific)
  - QPS → CPU cores explanation (universal)
  - Real coefficient values displayed
  - Step-by-step formula breakdowns
  - Practical examples for each scenario

#### FR-4.3 Results Display
**Priority**: High | **Status**: ✅ Implemented
- **Description**: Clear presentation of calculation results
- **Components**:
  - Effective QPS value
  - Per-service RPS breakdown
  - Per-service CPU cores
  - Total CPU cores
  - Visual representation of resource distribution

#### FR-4.4 Advanced Coefficient Override
**Priority**: Medium | **Status**: ✅ Implemented
- **Description**: Collapsible section for overriding default coefficients
- **Capabilities**:
  - Fanout coefficient customization
  - CPU per RPS coefficient customization
  - Real-time recalculation with custom values

### 3.5 Data Requirements

#### FR-5.1 Performance Coefficient Configuration
**Priority**: High | **Status**: ✅ Implemented
- **Description**: Centralized configuration of performance coefficients
- **Source**: Real monitoring data from BizChat production systems
- **Format**: JSON configuration with metadata
- **Location**: `src/config/performance-coefficients.json`
- **Versioning**: Version tracking for coefficient updates

#### FR-5.2 Default Value Management
**Priority**: Medium | **Status**: ✅ Implemented
- **Description**: Consistent default values across all scenarios
- **Behavior**: Defaults automatically populated when switching input modes
- **Validation**: Defaults must represent realistic operational scenarios

## 4. Non-Functional Requirements

### 4.1 Performance Requirements

#### NFR-1.1 Response Time
**Priority**: High | **Status**: ✅ Implemented
- **Requirement**: Single calculation must complete in < 10ms
- **Measurement**: Client-side execution time
- **Current Performance**: Sub-millisecond calculation times achieved

#### NFR-1.2 Page Load Time
**Priority**: Medium | **Status**: ✅ Implemented
- **Requirement**: Initial page load < 3 seconds on standard broadband
- **Measurement**: Time to interactive
- **Current Performance**: Vite optimized bundle loads rapidly

### 4.2 Usability Requirements

#### NFR-2.1 Accessibility
**Priority**: High | **Status**: ✅ Implemented
- **Standard**: WCAG 2.1 AA compliance
- **Features**:
  - Full keyboard navigation
  - ARIA labels for dynamic content
  - Sufficient color contrast ratios
  - Screen reader compatibility
  - Focus management

#### NFR-2.2 Responsive Design
**Priority**: High | **Status**: ✅ Implemented
- **Requirement**: Functional on devices from 320px to 1920px width
- **Breakpoints**: Mobile (< 768px), Tablet (768px-1200px), Desktop (> 1200px)
- **Current Implementation**: CSS Grid with responsive breakpoints

### 4.3 Reliability Requirements

#### NFR-3.1 Error Handling
**Priority**: High | **Status**: ✅ Implemented
- **Requirement**: No system crashes on invalid input
- **Implementation**: Graceful fallbacks with `getValueOrDefault()` pattern
- **User Experience**: Clear validation messages without interrupting workflow

#### NFR-3.2 Cross-Browser Compatibility
**Priority**: Medium | **Status**: ✅ Implemented
- **Supported Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Testing**: Responsive design tested across major browsers
- **Fallbacks**: Progressive enhancement approach

### 4.4 Security Requirements

#### NFR-4.1 Data Privacy
**Priority**: Medium | **Status**: ✅ Implemented
- **Requirement**: No PII collection or transmission
- **Implementation**: Client-side only calculations
- **External Calls**: None (fully offline after initial load)

#### NFR-4.2 Content Security
**Priority**: Low | **Status**: ✅ Implemented
- **Requirement**: No external script dependencies in production
- **Implementation**: Bundled application with no runtime external calls

### 4.5 Portability Requirements

#### NFR-5.1 Deployment Independence
**Priority**: High | **Status**: ✅ Implemented
- **Requirement**: Pure static site with no backend dependencies
- **Current Deployment**: GitHub Pages with automated CI/CD
- **Portability**: Can be deployed to any static hosting platform

#### NFR-5.2 Browser Independence
**Priority**: Medium | **Status**: ✅ Implemented
- **Requirement**: No browser-specific APIs or vendor prefixes
- **Implementation**: Standard web technologies (HTML5, CSS3, ES2020)

## 5. System Architecture

### 5.1 Technical Stack
- **Frontend Framework**: React 18 with TypeScript
- **Build System**: Vite 5.3+ with optimization
- **Styling**: CSS3 with CSS Variables
- **Deployment**: GitHub Pages with GitHub Actions CI/CD
- **Version Control**: Git with GitHub hosting

### 5.2 Component Architecture
```
src/
├── calc/
│   └── logic.ts              # Core calculation engine
├── config/
│   ├── ConfigurationLoader.ts # Configuration management
│   └── performance-coefficients.json # Real performance data
├── ui/
│   ├── App.tsx               # Main application component
│   ├── ScenarioForm.tsx      # Input form with dual modes
│   ├── Results.tsx           # Results display component
│   └── ConfigurationDisplay.tsx # Coefficient display
├── main.tsx                  # Application entry point
└── styles.css               # Global styling and responsive design
```

### 5.3 Data Flow
1. **User Input**: Parameters entered via ScenarioForm component
2. **Validation**: getValueOrDefault() ensures valid inputs
3. **Calculation**: Core logic processes scenario-specific formulas
4. **Fanout**: Service chain applies real monitoring coefficients
5. **CPU Mapping**: RPS converted to cores using production coefficients
6. **Display**: Results rendered with explanations and breakdowns

## 6. Quality Assurance

### 6.1 Testing Requirements
- **Unit Testing**: Core calculation logic (100% coverage goal)
- **Integration Testing**: Component interaction validation
- **Browser Testing**: Cross-browser compatibility verification
- **Accessibility Testing**: WCAG 2.1 AA compliance validation

### 6.2 Performance Monitoring
- **Build Size**: Monitor bundle size and optimization
- **Load Performance**: Measure and optimize initial page load
- **Runtime Performance**: Ensure sub-10ms calculation times

### 6.3 Code Quality
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency enforcement
- **Documentation**: Comprehensive inline documentation

## 7. Deployment and Operations

### 7.1 Deployment Pipeline
- **Source Control**: GitHub repository with branch protection
- **CI/CD**: GitHub Actions automated build and deployment
- **Hosting**: GitHub Pages with custom domain support
- **Monitoring**: GitHub repository insights and Pages analytics

### 7.2 Maintenance Requirements
- **Coefficient Updates**: Process for updating performance coefficients
- **Feature Updates**: Continuous deployment through GitHub Actions
- **Documentation**: Keep requirements and design docs current

## 8. Future Enhancements

### 8.1 Planned Features
- **Scenario Comparison**: Side-by-side scenario analysis
- **Export Functionality**: CSV/JSON export of calculations
- **Historical Coefficient Tracking**: Trend analysis of performance changes

### 8.2 Integration Opportunities
- **Kusto Integration**: Automated coefficient updates from monitoring systems
- **Azure DevOps**: Integration with capacity planning workflows
- **Teams Integration**: Shareable calculation results

## 9. Acceptance Criteria

### 9.1 Functional Acceptance
- ✅ All four scenarios calculate correctly with documented formulas
- ✅ Dual input modes work seamlessly with proper state management
- ✅ Real performance coefficients produce accurate results
- ✅ Calculation explanations provide educational value
- ✅ UI is professional, responsive, and accessible

### 9.2 Performance Acceptance
- ✅ Page loads in < 3 seconds
- ✅ Calculations complete in < 10ms
- ✅ Mobile experience is fully functional
- ✅ No crashes on invalid input

### 9.3 Deployment Acceptance
- ✅ Automated deployment pipeline functional
- ✅ Production site accessible and performant
- ✅ Cross-browser compatibility verified
- ✅ Accessibility standards met

## 10. Compliance and Standards

### 10.1 Accessibility Compliance
- **Standard**: WCAG 2.1 AA
- **Implementation**: Full keyboard navigation, ARIA labels, color contrast
- **Testing**: Automated and manual accessibility validation

### 10.2 Code Standards
- **Language**: TypeScript with strict type checking
- **Style**: ESLint configuration with consistent formatting
- **Documentation**: Comprehensive inline and external documentation

---
**Document Status**: ✅ **CURRENT** - Reflects production implementation as of September 19, 2025
**Next Review**: Quarterly or upon major feature additions