# Regression checks and acceptance criteria

> **Status:** APPROVED as requirements for all structural changes (brief §8). In Phase 1 these are built as **read-only checkers** (P1-08); no structural change is made in Phase 1.

### 13. Acceptance criteria

#### Permanent regression scenarios

| ID | Origin | Test |
|---|---|---|
| **R-PAPER-01** | Paper pilot: arrows added to primary buttons reached Default but missed Hover, Focus and Disabled | For any change scoped to a set, list every variant in scope (all states, sizes, themes). **Expected count = actual count**; any variant missing the change fails |
| **R-PENPOT-01** | Penpot pilot: master change didn't persist across instances after theme refresh (gap binding reverted 5/6) | After every main-level change: switch mode Light → Dark → Light, re-read every instance **value and binding** in a fresh call; after reload where practical |
| R-FIGMA-01 | Figma pilot F2 | After every `setProperties`, compare instance layer tree with its main component's; missing or extra layers fail |
| R-SLOT-01 | New | After slot migration: instance count unchanged, slot content preserved per instance, `limitViolations` empty, instances still linked |

#### Criteria for every structural change

1. Inventory of affected variants/states/sizes/themes/instances.
2. Expected affected count recorded before the change.
3. Actual count from structural read-back equals expected.
4. Visual comparison against the pre-change screenshot (pixel diff; changes only where intended).
5. Linkage: 100% of instances remote/linked; 0 detached.
6. Token bindings: 100% of required properties bound; 0 raw values introduced.
7. Icons from MAKER Icon library only; size/alignment/colour binding unchanged.
8. Light and Dark both verified.
9. Persistence: re-read in a separate call; after file reload where practical.
10. Original library `updatedAt` unchanged.

Visual similarity alone is never accepted as proof. Fidelity target ~95–98% applies only once approved reference images exist.
