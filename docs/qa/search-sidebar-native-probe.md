# Synthetic search probe

The fixed `search` scenario runs the actual NotetakerSidebar, interaction guard,
and scoped Library search hook in the existing isolated DOM runner. The native
and JavaScript allowlists contain the same eight scenarios. Per-probe, suite,
operator, process ownership, account-isolation and watchdog gates are unchanged.

The only additional HTTP response is an in-memory fictional workspace inventory
for GET `/api/knapsack/workspaces`, permitted only while the search probe runs.
Other requests still fail closed. The sidebar's unrelated team-management import
uses a serve-only QA adapter: supplied fictional roster, all mutations throw.
The adapter is scoped to that module, is absent from production build plugins,
and never changes the frozen native bridge or native IPC allowance.

Coverage:

- Both result types receive primary mousedown, forced null-relatedTarget blur,
  mouseup and click. No early activation; exact meeting key/ID and Meeting tab,
  or person UUID and Library tab, must be delivered exactly once.
- Drag, scroll, secondary press, Control-click and pointer cancellation do not
  activate. Typed query survives cancellation, Escape and focus dismissal.
- ArrowDown focuses the first result; detail-zero keyboard/AT activation remains
  usable; Escape and focus leaving close the result region.

Navigation consumers are synthetic callbacks. The actual MeetingNotesMode and
PersonWorkspace destination screens are not mounted by this probe. Scripted DOM
events in a real WebView would establish WebKit execution, not physical mouse or
trusted native keyboard-default-action acceptance.

Offline JSDOM/controller tests do not prove native acceptance. A future native
run still needs an exact clean reviewed tree, supported isolated build, free QA
ports, verified process ownership and a fresh foreground human Start checks
click. No native app has been launched as part of this preparation.
