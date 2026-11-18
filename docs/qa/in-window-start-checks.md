# Isolated QA Start checks gate

The launcher arms one fresh challenge only after empty-state and owned-listener
preflight. The fixture retains an early challenge but keeps Start checks disabled
until the native result bridge, component harness, and fixed probe dispatcher are
ready. Readiness does not extend the original 30-second operator deadline. A
trusted click must also pass frontend visibility/focus/expiry checks and native
owned-window visibility/focus, identity, nonce, expiry, and single-use checks.

Native `is_visible()` and `is_focused()` are synchronous calls without individual
timeouts. If either stalls, the handler has not consumed the ticket or written a
visibility marker. The separate Node launcher continues its existing 30-second
operator deadline; absent a marker it fails closed before writing `qa-dom-go.json`
and requests SIGTERM cleanup of its owned QA child and Vite process. This bounds
the launcher's acceptance decision, not either native call or guaranteed process
termination. No probe pass or native acceptance may be claimed from that failure.
The wrapper's separate inspection watchdog starts only after runtime-ready output;
it does not replace the launcher's operator deadline.

For a coordinated run, use a fresh identity and the exact reviewed source tree,
enable `KNAPSACK_QA_VISIBLE_OPERATOR_GATE=1`, bring the isolated QA window forward,
and click Start checks once when enabled. Keep it foreground. An expired challenge
requires a fresh coordinated run; do not write markers or automate the click.
