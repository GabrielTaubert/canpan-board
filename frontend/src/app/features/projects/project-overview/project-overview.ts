import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectService } from '../../../core/services/project';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-project-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './project-overview.html',
  styleUrl: './project-overview.scss',
})
export class ProjectOverview implements OnInit {
  projects: Project[] = [];
  newProjectName = '';
  editingProjectId: string | null = null;
  editingName = '';

  constructor(private projectService: ProjectService, private router: Router) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  private loadProjects(): void {
    this.projectService.getProjects().subscribe(projects => {
      this.projects = projects;
    });
  }

  createProject(): void {
    if (!this.newProjectName.trim()) return;
    this.projectService.createProject(this.newProjectName.trim()).subscribe(() => {
      this.newProjectName = '';
      this.loadProjects();
    });
  }

  startEdit(project: Project): void {
    this.editingProjectId = project.id;
    this.editingName = project.name;
  }

  cancelEdit(): void {
    this.editingProjectId = null;
    this.editingName = '';
  }

  saveEdit(id: string): void {
    if (!this.editingName.trim()) return;
    this.projectService.updateProject(id, this.editingName.trim()).subscribe(updated => {
      const index = this.projects.findIndex(p => p.id === id);
      if (index !== -1) {
        this.projects[index] = updated;
      }
      this.cancelEdit();
    });
  }

  deleteProject(id: string): void {
    this.projectService.deleteProject(id).subscribe(() => {
      this.projects = this.projects.filter(p => p.id !== id);
    });
  }

  openProject(id: string): void {
    this.router.navigate(['/project', id, 'board']);
  }

  openMembers(id: string): void {
    this.router.navigate(['/project', id, 'members']);
  }
}
