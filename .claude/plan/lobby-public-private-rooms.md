# Lobby & Public/Private Rooms Feature

## Overview
Add a lobby page where players can discover and join public rooms without needing a room code. Room creators can choose to make rooms public (visible in lobby) or private (code required).

## User Requirements
- **Lobby page** at `/lobby` - list all public waiting rooms with grade filter
- **Default to PUBLIC** when creating rooms
- **Room names** - optional, auto-generate with datetime if not provided (e.g., "P3 Challenge - Jan 18, 2:30 PM")
- **Navigation** - new route for lobby, keep landing page light

---

## Implementation Plan

### Phase 1: Database Migration
**File:** `supabase/migrations/00005_lobby_feature.sql`

```sql
ALTER TABLE rooms ADD COLUMN is_public BOOLEAN DEFAULT TRUE;
ALTER TABLE rooms ADD COLUMN name VARCHAR(100);

CREATE INDEX idx_rooms_lobby ON rooms(is_public, status, expires_at)
  WHERE is_public = TRUE AND status = 'waiting';
```

### Phase 2: Type Updates
**File:** `src/types/database.ts`
- Add `is_public: boolean` and `name: string | null` to Room types (Row, Insert, Update)

**File:** `src/types/room.ts`
- Add new type:
```typescript
export interface LobbyRoom extends Room {
  player_count: number;
  host_nickname: string;
}
```

### Phase 3: Constants
**File:** `src/utils/constants.ts`
- Add `lobby: "/lobby"` to ROUTES
- Add `LOBBY_REFRESH_INTERVAL_MS = 5000`
- Add `lobby: () => "lobby:public-rooms"` to REALTIME_CHANNEL

### Phase 4: Service Layer
**File:** `src/services/roomService.ts`

1. **Update `createRoom`**:
   - Add `isPublic?: boolean` and `name?: string` params
   - Auto-generate name: `P{grade} Challenge - {Mon DD, H:MM AM/PM}`

2. **Add `fetchPublicRooms`**:
   - Query public, waiting, non-expired, non-full rooms
   - Return with player_count and host_nickname
   - Support optional grade filter

3. **Add `joinRoomById`**:
   - Join by room ID (not code) for lobby joins
   - Same validations as joinRoom

**File:** `src/services/lobbyService.ts` (new)
- `subscribeToLobby(onRoomsChange, gradeFilter?)` - realtime subscription for lobby updates

### Phase 5: State Management
**File:** `src/stores/lobbyStore.ts` (new)
```typescript
interface LobbyState {
  rooms: LobbyRoom[];
  isLoading: boolean;
  error: string | null;
  gradeFilter: number | null;
  loadRooms: () => Promise<void>;
  setGradeFilter: (grade: number | null) => void;
  subscribe: () => () => void;
}
```

**File:** `src/stores/roomStore.ts`
- Add `joinRoomById(roomId, deviceId, nickname)` action
- Update `createRoom` to accept `isPublic` and `name` in settings

### Phase 6: UI Components

**File:** `src/components/RoomCard.tsx` (new)
- Room card for lobby display
- Shows: name, host, grade badge, settings (questions, time), player count
- Join button

**File:** `src/pages/LobbyPage.tsx` (new)
- Nickname input (sticky)
- Action buttons: Create Room, Join by Code
- Grade filter chips (All, P1-P6)
- Room list with RoomCard components
- Real-time updates via lobbyStore subscription
- Empty state: "No games available - Create the first game!"

**File:** `src/pages/CreateRoomPage.tsx` (update)
- Add Public/Private toggle (default: Public)
- Add optional room name input
- Helper text explaining visibility

**File:** `src/pages/HomePage.tsx` (update)
- Add "Find a Game" as primary button
- Reorder: Find a Game > Create Room > Join with Code

### Phase 7: Router
**File:** `src/App.tsx`
- Add route: `<Route path="/lobby" element={<LobbyPage />} />`

---

## Files to Modify/Create

| File | Action |
|------|--------|
| `supabase/migrations/00005_lobby_feature.sql` | Create |
| `src/types/database.ts` | Modify |
| `src/types/room.ts` | Modify |
| `src/utils/constants.ts` | Modify |
| `src/services/roomService.ts` | Modify |
| `src/services/lobbyService.ts` | Create |
| `src/stores/lobbyStore.ts` | Create |
| `src/stores/roomStore.ts` | Modify |
| `src/components/RoomCard.tsx` | Create |
| `src/pages/LobbyPage.tsx` | Create |
| `src/pages/CreateRoomPage.tsx` | Modify |
| `src/pages/HomePage.tsx` | Modify |
| `src/App.tsx` | Modify |

---

## Verification Plan

1. **Database**: Run `supabase db reset` to apply migration
2. **Create public room**: Should appear in lobby
3. **Create private room**: Should NOT appear in lobby
4. **Join from lobby**: Click Join, navigate to waiting room
5. **Grade filter**: Filter works correctly
6. **Real-time**: New rooms appear, full rooms disappear
7. **Room name**: Auto-generated includes datetime
8. **Existing flows**: Join by code still works for private rooms
9. **Mobile**: Test responsive layout
