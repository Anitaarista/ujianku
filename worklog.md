# UjianKu Mobile App - Complete Redesign Worklog

## Date: 2026-03-04

## Summary
Complete mobile app redesign with PRO-MAX UI/UX, role restriction for mobile (Siswa & Pengawas only), and removal of Admin/Guru routes.

---

## Changes Made

### 1. Login Screen Redesign (`lib/screens/login_screen.dart`)
- **Role Restriction**: Mobile now ONLY allows SISWA and PENGAWAS roles
- If API returns ADMIN or GURU role after login, shows error: "Admin/Guru harus login melalui website UjianKu." and clears user data
- **PRO-MAX UI/UX Redesign**:
  - Modern gradient background (dark emerald to teal)
  - Large app logo with white glow effect (boxShadow)
  - Clean white bottom sheet form area with rounded top corners
  - High contrast text - all text clearly readable (Color(0xFF1A1A2E) for primary, Colors.grey[600] for secondary)
  - Proper text field styling with clear labels and focus animations
  - Professional gradient login button with shadow
  - Smooth animations (fadeIn, slideUp) on load
  - Subtle app version text at bottom

### 2. Routes Cleanup (`lib/config/routes.dart`)
- **REMOVED** all Admin routes (`/admin`, `/admin/users`, `/admin/settings`) and `AdminShell`
- **REMOVED** all Guru routes (`/guru`, `/guru/bank-soal`, `/guru/exams`, `/guru/results`) and `GuruShell`
- **REMOVED** all placeholder screens (`AdminUsersScreen`, `AdminSettingsScreen`, `GuruBankSoalScreen`, `GuruExamsScreen`, `GuruResultsScreen`)
- **REMOVED** imports for admin/home_screen.dart and guru/home_screen.dart
- **KEPT** only Siswa and Pengawas routes with their shells
- Updated BottomNavigationBar styling: `selectedItemColor: AppTheme.primary`, `unselectedItemColor: Colors.grey`

### 3. App Configuration (`lib/app.dart`)
- Initial location now only allows `/siswa` or `/pengawas`
- If stored role is admin/guru, clears storage and redirects to `/` (splash/login)
- Removed switch cases for admin/guru

### 4. Deleted Admin/Guru Directories
- Deleted `lib/screens/admin/` directory entirely
- Deleted `lib/screens/guru/` directory entirely

### 5. Constants Cleanup (`lib/utils/constants.dart`)
- Removed `routeAdminHome` and `routeGuruHome` constants
- Added comment noting mobile only supports Siswa and Pengawas

### 6. Siswa Screen Redesigns

#### `home_screen.dart`
- Screen background: `Color(0xFFF8F9FA)` (light grey)
- White stat cards with proper shadows and borders
- Stats numbers: 24px, FontWeight.w800, colored
- Labels: Colors.grey[600], FontWeight.w600
- Quick action buttons: White background, grey border, 48x48 icon containers
- Exam cards: White with boxShadow
- Empty state: 64px icon, Colors.grey[400], bold message, subtitle
- Header: Gradient with proper padding

#### `exam_list_screen.dart`
- White AppBar with elevation 0.5
- Search: Dark text (Color(0xFF1A1A2E)), grey hint
- Filter chips: White background, proper selected/unselected colors
- Error state: Red[50] background, red[700] text
- Empty states: Large icon, bold message, subtitle helper

#### `exam_detail_screen.dart`
- Gradient header card with shadow
- Info section: White card with grey border and shadow
- Info rows: Dark label values (FontWeight.w700, Color(0xFF1A1A2E))
- Rules section: Amber background, dark text (Colors.grey[800])
- Checkbox: Clean styling with border states

#### `exam_take_screen.dart`
- White AppBar, dark title text
- Progress bar: Grey[200] background, primary color
- Question indicator: White container, dark text
- Bottom nav: White with grey border, dark text
- Navigation drawer: Gradient header, colored status indicators
- Exit warning: Orange warning icon, grey body text

#### `exam_result_screen.dart`
- White score card with shadow (instead of colored background)
- Score circle: Colored with proper contrast
- Pass/fail status: Colored background, bold text
- Stat boxes: Colored with alpha, bold values
- Score rows: Grey icon, dark values, bold total
- Review cards: White with colored border, proper contrast

#### `profile_screen.dart`
- Gradient header with shadow
- Info sections: White cards with shadow and border
- Info rows: Dark values (FontWeight.w700), grey labels
- Stats: Colored containers, bold values
- Settings: Dark text, grey secondary text
- Logout: Danger variant button

### 7. Pengawas Screen Redesigns

#### `home_screen.dart`
- Dark header gradient with role badge
- Session card: White with shadow, colored status badges
- Stats: White cards with colored accents, bold numbers
- Quick actions: Colored background with matching icons and labels
- Violation cards: White with colored border, bold student names
- Error state: Red icon, grey message, outline retry button

#### `monitoring_screen.dart`
- White AppBar, dark text
- Session info bar: White with grey border
- Status pills: Colored with alpha background
- Student list items: White with shadow, dark names
- Session selection: White cards with rounded corners
- Auto-refresh indicator: Primary with alpha

#### `violation_list_screen.dart`
- White AppBar, dark text
- Search: Dark text style, grey hint
- Filter chips: Compact, primary delete icon
- Summary bar: Grey background, colored severity badges
- Violation cards: White with colored border, bold student names
- Detail sheet: White with proper contrast
- Empty state: Large icon, bold message, subtitle

#### `student_detail_screen.dart`
- Dark gradient header with avatar
- White status/progress card with shadow
- Dark text values, grey secondary
- Violation history: White cards with colored border
- Action buttons: Outline warn, danger disqualify, ghost allow
- Confirmation dialogs: Dark text, grey body

#### `report_screen.dart`
- Gradient header with shadow
- Stat cards: Colored with alpha, bold numbers
- Completion bar: White card with shadow
- Violation section: Conditional coloring, bold numbers
- Student table: Grey header, white rows, dark text
- Action buttons: Outline PDF, danger end session

---

## Design Principles Applied

1. **Text Contrast**: Dark text on light backgrounds (`Color(0xFF1A1A2E)` or `Colors.grey[900]`)
2. **Secondary Text**: `Colors.grey[600]` minimum - never lighter than grey[500]
3. **Card Design**: White background, subtle shadow (`BoxShadow blurRadius: 8`), `borderRadius: 16`
4. **Stats Numbers**: Font size 24+, `FontWeight.w800`, colored
5. **Status Badges**: Dark text on colored backgrounds, or colored text on white with colored border
6. **Bottom Navigation**: `selectedItemColor: AppTheme.primary`, `unselectedItemColor: Colors.grey`
7. **App Bars**: White background, dark title text, `elevation: 0.5`
8. **Empty States**: Large icon (64px), clear message text, helper subtitle
9. **Error States**: Red icon, clear error text, retry button
10. **Loading States**: `CircularProgressIndicator` with `AppTheme.primary` color

## Color Standards Used
- Primary text: `Color(0xFF1A1A2E)` / `Colors.grey[900]`
- Secondary text: `Colors.grey[600]`
- Hint text: `Colors.grey[500]`
- Error text: `Colors.red[700]`
- Success text: `Colors.green[700]`
- Card backgrounds: `Colors.white`
- Screen background: `Color(0xFFF8F9FA)` / `Colors.grey[50]`
