# Robobo Backend Service

The Robobo backend service is built on Next.js, implementing an AI-powered robot pet battle game server with dialogue system, personality evolution, and battle analysis capabilities.

## System Architecture

The system adopts a layered architecture design with the following core modules:

### [Elizant Framework](https://github.com/elizant-labs/elizant) (Core Framework)

Elizant is a flexible Agent framework that manages and coordinates various subsystems:

- **Character System**: 
  - Robot personality definition
  - Behavior pattern management
  - Knowledge system integration
  
- **Spec Builder**:
  - OpenAPI specification generation
  - Role definition
  - Capability declaration management

- **Action System**:
  - Tool registration
  - Capability mapping
  - Permission management

- **Memory System**:
  - RAG engine
  - Memory retrieval
  - Knowledge update

### Evaluators

- **Character Evaluator**:
  - Dialogue analysis
  - Behavior assessment
  - Personality evolution evaluation

- **Reward Evaluator**:
  - Behavior reward calculation
  - Achievement completion
  - Incentive mechanism management

- **Battle Evaluator**:
  - Battle analysis
  - Strategy evaluation
  - Element analysis

### Adapters Layer

- **Business Adapter**: Business logic adaptation
- **Chat Model Adapter**: AI model integration
- **Chain Adapter**: Blockchain interaction

### Storage Layer

- Relational Database: Structured data storage
- Vector Database: Semantic vector storage
- SUI Blockchain: On-chain data storage
- Caching System: Performance optimization

## Core Processes

1. **Agent Initialization**:
   - Fetch specifications via robot ID
   - Construct Agent instance based on specs
   - Load historical memory and personality traits

2. **Dialogue Process**:
   - Receive user input
   - Generate response with memory context
   - Evaluate personality changes
   - Calculate dialogue rewards
   - Return comprehensive results

3. **Memory Management**:
   - Store dialogue records
   - Update personality traits
   - Analyze battle records
   - Update knowledge base

## Module Status

### Storage Layer
- Relational Database [WIP]
- Vector Database Integration [TODO]
- SUI Chain Interaction [WIP]
- Caching System [TODO]

### Elizant Framework
- Spec Builder [WIP]
- Character System [TODO]
- Action System [TODO]
- Memory System [TODO]
- Agent Runtime [WIP]

### Evaluators
- Character Evaluator [TODO]
- Battle Evaluator [TODO]
- Reward Evaluator [TODO]

### Adapters Layer
- Chat Model Adapter [WIP]
- Business Adapter [WIP]
- Blockchain Adapter [WIP]

[WIP] - Work In Progress
[TODO] - Not Started

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## Requirements

- Node.js 18+
- PostgreSQL
- Redis
- SUI Node Access

## Configuration

The project uses a .env file for configuration, including:

- Database connections
- AI model settings

```env
# Connect to Supabase via connection pooling with Supavisor.
DATABASE_URL=

# Direct connection to the database. Used for migrations.
DIRECT_URL=

# Atoma API Configuration
ATOMA_API_KEY=
ATOMA_API_URL=
ATOMA_MODEL=
```

## API Documentation

API documentation is auto-generated using OpenAPI specification and can be accessed at:
http://localhost:3000/api/swagger
