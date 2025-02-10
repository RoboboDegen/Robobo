# Robobo Smart Contracts

The Robobo smart contract system is implemented in Sui Move, providing core game logic including Robot NFT minting, attribute management, battle system, and equipment management.

## Contract Architecture

The contract system consists of the following modules:

```
contract/
├── sources/                    # Contract source code
│   ├── game.move              # Core game logic
│   ├── element.move           # Equipment system
│   ├── robot.move             # Robot NFT implementation
│   ├── battle.move            # Battle system
│   ├── user.move              # User system
│   ├── config.move            # Game configuration
│   └── trash.move             # Token system
├── Move.toml                  # Project configuration
└── tests/                     # Test cases
    ├── game_tests.move
    ├── element_tests.move
    ├── robot_tests.move
    └── battle_tests.move
```

## Core Modules

### 1. Game Module (`game.move`)
Core game state management and business logic implementation.

#### Key Data Structures
```move
struct GameState has key, store {
    id: UID,
    passports: Table<address, ID>,    // User passport records
    robots: vector<ID>,               // Robot records
    elements: Table<ID, vector<ID>>,  // Equipment records
    total_battles: u64,               // Total battle count
    rankings: Table<ID, u64>          // Leaderboard
}

struct AdminCap has key, store {
    id: UID
}

struct BattleRewardEvent has copy, drop {
    winner_id: ID,
    loser_id: ID,
    token_reward: u64,
    has_element_drop: bool,
    timestamp: u64
}
```

### 2. Element Module (`element.move`)
Robot equipment system implementation.

#### Key Data Structures
```move
struct Element has key, store {
    id: UID,
    name: String,
    description: String,
    abilities: vector<u8>,  // [Attack, Defense, Speed, Energy, Core]
}
```

#### Attribute System
- 5 Core Attributes: Attack, Defense, Speed, Energy, Core
- Attribute Threshold (ABILITY_THRESHOLD = 128):
  - > 128: Attribute boost
  - < 128: Attribute reduction
- Balance Mechanism: Only one attribute per equipment can exceed threshold

## Core Features

### 1. User System
- `create_passport`: Create user passport as identity credential
- `claim_daily_token`: Daily TRASH token rewards
- User permission management and state tracking
- On-chain user data storage and verification

### 2. Robot NFT System
- `mint_robot`: Mint Robot NFT using TRASH tokens
- Robot attribute system:
  - Base attributes: Attack, Defense, Speed, etc.
  - Equipment slots: Different types of equipment
  - Battle records: Win rate, points, etc.
- Robot attribute upgrades and evolution

### 3. Equipment System
- Five core attributes
- Equipment acquisition:
  - Battle rewards
  - Chat interaction drops
  - System rewards
- Equipment mechanism:
  - TRASH token consumption
  - Attribute stacking
  - Equipment slot restrictions

### 4. Battle System
- `random_battle`: Random matchmaking
- Battle mechanics:
  - Calculation based on robot attributes and equipment
  - Equipment bonus effects
  - Random factors
- Reward system:
  - Battle points
  - TRASH token rewards
  - Equipment drops
- Leaderboard updates

## Token Economics

### TRASH Token
- Uses:
  - Robot NFT minting
  - Battle participation
  - Equipment management
  - Attribute upgrades
- Acquisition:
  - Daily sign-in rewards
  - Battle victory rewards
  - Special event rewards
- Token economy:
  - Inflation control
  - Token burn mechanism
  - Reward balance

## Technical Features

### Security
- Sui Move ownership system for asset security
- Comprehensive permission checks:
  - Admin privileges
  - User operation verification
  - Asset transfer restrictions
- Detailed error handling
- Transaction atomicity guarantee

### Extensibility
- Modular design for easy feature expansion
- Support for future gameplay:
  - Reserved interfaces
  - Configurable parameters
  - Low module coupling
- Reserved attribute and state expansion space

### Randomness
- Fair battle matching using Sui on-chain random numbers
- Unpredictable battle results
- Anti-cheating mechanism

## Development Guide

### Environment Requirements
- Sui Move Compiler
- Move Test Framework
- Sui CLI Tools
- Development IDE (VSCode + Move Plugin recommended)

### Build & Deploy
```bash
# Build contract
sui move build

# Test
sui move test

# Deploy (network configuration required)
sui client publish --gas-budget 10000
```

### Testing
```bash
# Run all tests
sui move test

# Run specific tests
sui move test game_tests
sui move test element_tests
sui move test battle_tests
```

## Contract Call Flow

### 1. Initialization
```move
// 1. Deploy contract
// 2. Initialize game state
fun init(_: GAME, ctx: &mut TxContext)
```

### 2. User Flow
```move
// 1. Create passport
create_passport(name, game_state, game_config, token_cap, ctx)

// 2. Claim tokens
claim_daily_token(game_config, passport, token_cap, ctx)

// 3. Mint robot
mint_robot(game_state, game_config, robot_pool, robot_name, payment, token_policy, ctx)

// 4. Battle
random_battle(game_state, game_config, robot_pool, robot, payment, token_policy, token_cap, random, clock, ctx)
```

## Error Handling

### Error Codes
```move
const E_ALREADY_HAS_PASSPORT: u64 = 0;
const E_NO_PASSPORT: u64 = 1;
const E_ALREADY_CLAIMED_TODAY: u64 = 2;
const E_INSUFFICIENT_TRASH: u64 = 3;
const E_INVALID_ELEMENT: u64 = 4;
const E_BATTLE_IN_COOLDOWN: u64 = 5;
```

### Error Handling Mechanism
- Complete error checking
- Clear error messages
- Transaction rollback protection

## Important Notes

1. All transactions require TRASH tokens
2. Equipment attributes must meet balance requirements
3. Battle results determined by on-chain random numbers
4. Regular game configuration maintenance required
5. Important operations require transaction confirmation
6. Test thoroughly on testnet before mainnet deployment