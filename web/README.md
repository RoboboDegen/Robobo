# Robobo Web Frontend

The Robobo Web frontend is developed using Next.js + React framework, integrating the Phaser game engine to create an NFT-enabled robot pet battle game.

## System Architecture

The system adopts a modular design, consisting of the following core components:

### Game Engine Layer (Phaser Game Engine)

- **Background System**:
  - Scene rendering
  - Map loading
  - Environmental effects

- **Animation System**:
  - Character animations
  - Special effects
  - State transition animations

- **Sound System**:
  - Background music
  - Battle sound effects
  - Environmental audio

- **State Machine System**:
  - Character state management
  - Battle state transitions
  - Game progress control

### Game UI Layer

- **Connection Module**:
  - Wallet connection
  - Network status management
  - Account management

- **Minting Module**:
  - NFT minting
  - Robot generation
  - Attribute allocation

- **Home Module**:
  - Robot showcase
  - Status overview
  - Feature navigation

- **Inventory Module**:
  - Equipment management
  - Item management
  - Asset display

- **Battle Module**:
  - Battle matching
  - Battle interface
  - Reward settlement

- **Chat Module**:
  - AI dialogue
  - Reward system
  - Personalized interaction

### Tech Stack

- **Frontend Framework**:
  - Next.js 14
  - React 18
  - TypeScript
  - TailwindCSS

- **Game Engine**:
  - Phaser 3

- **Web3 Integration**:
  - SUI Wallet
  - Web3 API

- **State Management**:
  - React Context
  - Custom Hooks

## Directory Structure

```
web/
├── app/                # Next.js application main directory
│   ├── page.tsx       # Main page
│   ├── layout.tsx     # Layout component
│   └── providers.tsx  # Global providers
├── game/              # Game-related code
│   ├── scenes/        # Game scenes
│   ├── core/          # Core logic
│   ├── gameObject/    # Game objects
│   └── config/        # Configuration files
├── components/        # React components
├── hooks/             # Custom hooks
├── context/          # Global state
├── contracts/        # Smart contract interaction
├── utils/            # Utility functions
└── types/            # Type definitions
```

## Core Features

1. **Wallet Integration**:
   - SUI wallet support
   - Asset management
   - Transaction processing

2. **NFT System**:
   - Robot NFT minting
   - Attribute system
   - Equipment system

3. **Battle System**:
   - PVP battles
   - Reward mechanism
   - Leaderboard

4. **AI Interaction**:
   - Intelligent dialogue
   - Personalized interaction
   - Behavior learning

## Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```

## Requirements

- Node.js 18+
- PNPM
- Modern browser (WebGL support)

## Configuration

The project uses a `.env` file for configuration:

```env
NEXT_PUBLIC_API_URL=      # Backend API URL
NEXT_PUBLIC_CHAIN_ID=     # SUI Chain ID
NEXT_PUBLIC_CONTRACT_ID=  # Contract Address
```

## Development Guide

1. **Game Scene Development**:
   - Create new scenes in `game/scenes`
   - Extend Phaser.Scene
   - Implement preload/create/update methods

2. **UI Component Development**:
   - Use TailwindCSS styling
   - Follow React component best practices
   - Ensure Web3 functionality compatibility

3. **Contract Interaction**:
   - Use utility functions in `contracts` directory
   - Handle transaction states and errors
   - Implement event listeners