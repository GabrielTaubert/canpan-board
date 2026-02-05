#Project Requirements

This document describes the functional requirements of the system using Mandatory, MUST, SHOULD, and CAN priorities.

##Technical and Acceptance Requirements (Mandatory)

T01: The system must provide an Angular-based frontend using Angular Router for menu
navigation.

T02: The system must provide a backend that is utilized by the frontend via a defined API.

T03: The system must use Karma as the test runner for frontend tests.

T04: The system must achieve a test coverage of more than 60% (line, branch, and
function coverage), including end-to-end tests.

T05: The system must be delivered as a runnable VirtualBox virtual machine including all
documentation before the submission deadline.

##MUST Requirements

###Authentication & Session Management

F01: The system must provide user registration for new users.
Explanation: Users must be able to create an account to use the application.

F02: The system must provide user login for registered users.
Explanation: Registered users must authenticate to access protected content.

F03: The system must provide user logout for authenticated users.
Explanation: Users must be able to terminate their session at any time.
Project Overview

F04: The system must provide a project overview page for authenticated users.
Explanation: Users must see an overview of all projects they are members of.

F05: The system must provide project creation for authenticated users.
Explanation: Users must be able to create new projects.

F06: The system must display project members for each project.
Explanation: Users must see which members belong to a project.

F07: The system must provide project deletion for authenticated users.
Explanation: Projects must be removable by authorized users.

###Project Navigation

F08: The system must provide Angular Router-based navigation for project functions.
Explanation: Project functions must be accessible via dedicated Angular routes.
Kanban Board

F09: The system must provide a Kanban board view for project members.
Explanation: The Kanban board is the primary view for task management.

F10: The system must provide workflow column management for project members.
Explanation: Project members must be able to create, edit, and delete workflow columns
representing task states such as “To Do”, “In Progress”, or “Done”.

F11: The system must provide task creation for project members.
Explanation: Tasks must be creatable from the Kanban board and the task list view.

F12: The system must provide drag-and-drop task movement for users.
Explanation: Tasks must be movable between workflow columns.

###Task List View

F13: The system must provide a task list view for project members.
Explanation: Users must see all project tasks in a structured list.

F14: The system must display task status information for each task.
Explanation: The task status corresponds to the Kanban board column.

###Task Detail View

F15: The system must provide a task detail view for project members.
Explanation: The task detail view shall display and allow editing of the task title,
description, priority, story points, assigned users, and attachments.

F16: The system must provide functionality to upload image attachments to a task for
users.
Explanation: Users can upload images such as mockups or screenshots.
(Satisfies: Mandatory file upload)

F17: The system must provide functionality to download attachments from a task for users.
Explanation: Users must be able to download uploaded task attachments.
(Satisfies: Mandatory file download)

###Project Dashboard

F18: The system must provide a project dashboard for project members.
Explanation: The dashboard visualizes overall project progress.

F19: The system must display task statistics for projects.
Explanation: Statistics such as open vs. completed tasks support progress tracking.
Backend Computation

F20: The system must provide a long-running backend computation task for project
statistics.
Explanation: Aggregated project statistics (e.g., story points per user or task completion
rate) shall be calculated with progress status updates displayed in the frontend.
(Satisfies: Mandatory long-running backend task)

###Member Management

F21: The system must provide a member management view for project administrators.
Explanation: Administrators must manage project members.

F22: The system must provide project member management for administrators.
Explanation: Administrators must be able to add, edit, and remove members within a
project, including role or permission changes.

##SHOULD Requirements

S01: The system shall provide creation of additional task labels for users.
Explanation: Labels such as UI, Backend, or Architecture can be defined.

S02: The system shall provide a story points summary for users.
Explanation: Helps evaluate workload distribution.

S03: The system shall display last modification information for each project.
Explanation: Users can track recent project activity.

S04: The system shall provide a dialog window for task editing.
Explanation: The dialog window is an alternative presentation of the task detail view.

S05: The system shall provide user profile editing for users.
Explanation: Users may update personal profile information.

S06: The system shall provide editing of the Kanban board name.
Explanation: Boards may be renamed.

##CAN Requirements

C01: The system can provide an archive function to hide completed tasks older than 30
days.

C02: The system can provide notifications for users.
Explanation: Users may be notified about changes or assignments.

C03: The system can provide task search functionality by text content.

C04: The system can provide a comment section for tasks.
Explanation: Users may discuss tasks directly within the system.
