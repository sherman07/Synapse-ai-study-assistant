# Focus Room Page Topology

```text
FocusRoomPage
├── FocusRoomBackground
│   ├── poster / current local video
│   ├── background-aware readability overlay
│   └── reduced-motion fallback
├── FocusRoomHeader
│   ├── Synapse brand lockup
│   ├── Focus Trail
│   ├── Companion Room
│   ├── Room Settings
│   └── Exit
├── LandingOrSceneSelection
│   ├── landing hero / start action
│   ├── SceneSelectionOverlay
│   ├── MusicSelection
│   └── DurationSelection
├── ActiveSessionHUD
│   ├── Pomodoro label/status
│   ├── live timer/progress
│   ├── goal
│   ├── pause/resume
│   └── Focus Mode toggle
├── CompactFocusTimer
├── RoomSettingsPanel
│   ├── scene library
│   ├── music master
│   ├── scene sound preset
│   └── AudioMixer
├── FocusTrailPanel
├── CompanionRoomPanel
├── SynapseToolsPanel
│   ├── StudyMaterialWorkspace
│   ├── AI Tutor
│   ├── Quiz
│   ├── Flashcards / matching
│   ├── Mind Map
│   ├── Notes/bookmarks
│   └── History/progress
└── FocusRoomExitDialog / CompletionSummary
```

Fixed layers: background z-0, readability overlay z-10, header/content z-20, scrim z-30, drawers/dialogs z-40+. The existing Synapse tool data stays in its current Zustand/query/API path; only the visual shell and presentation surfaces change.

