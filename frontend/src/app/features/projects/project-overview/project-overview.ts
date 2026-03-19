import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectService } from '../../../core/services/project';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-project-overview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project-overview.html',
  styleUrl: './project-overview.scss',
})
export class ProjectOverview implements OnInit {
  projects: Project[] = [];
  newProjectName = '';

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

  deleteProject(id: string): void {
    this.projectService.deleteProject(id).subscribe(() => {
      this.projects = this.projects.filter(p => p.id !== id);
    });
  }

  openProject(id: string): void {
    this.router.navigate(['/project', id, 'board']);
  }
}
