# Nya-AI design: Sage & Clay

Replaced the Orbit navy and brass theme on 2026-10-30. The owner found Orbit too aggressive and asked
for a pleasant palette with controls that still catch the eye on first view. Orbit's layout stays
(trace panel, cited ¶ answer, temporal panel, consult plan, call room); only the theme and the
controls changed.

## Sources studied

- **Radix Colors** (MIT, https://github.com/radix-ui/colors): the sage, jade, sand and amber scales
  set the neutrals, the action colour and the warning tones, and their step 11/12 rule for text
  contrast.
- **Magic UI** (MIT, https://github.com/magicuidesign/magicui): border beam, shimmer button, magic
  card and highlighter. Rewritten as plain CSS in `frontend/src/index.css` because Magic UI targets
  Tailwind 4 and `next-themes`, and this app is Tailwind 3.
- **shadcn/ui** (MIT): token names and the button and badge components were already in place.

## Palette

| Token (Tailwind name) | Hex | Use |
| --- | --- | --- |
| `bg` | `#F6F4EE` | warm paper page background, faint dot grid, soft jade and clay wash |
| `surface` | `#FFFFFF` | cards, panels |
| `soft`, `line`, `input` | `#EEEBE3`, `#E3DFD5`, `#D5D0C4` | quiet fills and borders |
| `ink`, `body3`, `body2`, `muted`, `faint` | `#1C2321` to `#6F7773` | text; `faint` still passes 4.5:1 on white |
| `primary` | `#1E6B5C` (jade) | actions, active nav, focus ring; white text 6.3:1 |
| `primary-tint` | `#E3F1EC` | active nav and tab pill |
| `brass` (now clay) | `#E0894A` | attention: answer edge, dots, marker, beam |
| `brass-light` (clay text) | `#A4551F` | mono labels and citation numbers; 5.4:1 on white |
| `brass-soft`, `brass-glow` | `#FCEFE3`, `#F2B184` | tinted tiles, highlights on dark panels |
| `navy-*` (now deep jade) | `#0F2E28` to `#2E6E60` | only the login hero panel |

The old token names (`navy`, `brass`) are kept so no page had to be rewritten; the comments in
`tailwind.config.js` say what each now holds.

## Signature controls

1. **Beam composer** (`.beam`): a slow jade-to-clay light travels round the chat box; it speeds up
   and fills in when the box has focus.
2. **Tactile keys** (`.key`, the default `Button` variant and every primary CTA): a raised jade
   button that sinks 2px on press, with a light sweep on hover.
3. **Spotlight cards** (`.spotlight` + `trackSpotlight`): a soft clay glow follows the pointer on
   the chat starter cards and the lawyer cards.
4. **Sliding pills**: active nav, the phone tab dock, the login role switch and the lawyer filters
   slide between options with a spring (`motion` `layoutId`).
5. **Marker highlight** (`.marker`): a clay highlighter stroke draws under the key word of a
   headline ("Nya-AI.", "within reach.", the dashboard name).
6. **Floating tab dock** on phones, with a clay dot on the active tab, and a pulsing halo round the
   logo on the empty chat.

All motion stops under `prefers-reduced-motion`.

## Not done yet

- No dark mode. The tokens are plain hex, so a dark mode would first move them to CSS variables.
- The Orbit canvas artifact still shows the old navy theme; the app is now the reference for colour.
