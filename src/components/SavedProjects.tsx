import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, Trash2, Plus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export interface SavedProject {
  id: string;
  oppNumber: string;
  customerName: string;
  projectName: string;
  lastModified: string;
  currentStep: number;
}

interface SavedProjectsProps {
  projects: SavedProject[];
  activeProjectId: string | null;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  onContinue: () => void;
  onBack: () => void;
  showBack: boolean;
}

export default function SavedProjects({ projects, activeProjectId, onLoad, onDelete, onNew, onContinue, onBack, showBack }: SavedProjectsProps) {
  if (projects.length === 0) {
    return null;
  }

  const formatProjectName = (project: SavedProject) => {
    const parts = [project.oppNumber, project.customerName, project.projectName].filter(Boolean);
    return parts.length > 0 ? parts.join(' — ') : 'Untitled Project';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Saved Projects</CardTitle>
          <Button size="sm" variant="outline" onClick={onNew}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            New
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="divide-y divide-border">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`flex items-center justify-between py-2.5 first:pt-0 last:pb-0 ${
                project.id === activeProjectId ? 'opacity-100' : 'opacity-75 hover:opacity-100'
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate text-foreground">
                  {formatProjectName(project)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Step {project.currentStep} · {project.lastModified}
                </p>
              </div>
              <div className="flex items-center gap-1 ml-3">
                {project.id !== activeProjectId && (
                  <Button size="sm" variant="ghost" onClick={() => onLoad(project.id)}>
                    <FolderOpen className="h-3.5 w-3.5" />
                  </Button>
                )}
                {project.id === activeProjectId && (
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                    Active
                  </span>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete project?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the saved data for "{formatProjectName(project)}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(project.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between pt-2 border-t border-border">
          {showBack ? (
            <Button variant="outline" onClick={onBack}>Back</Button>
          ) : (
            <div />
          )}
          <Button onClick={onContinue}>Continue</Button>
        </div>
      </CardContent>
    </Card>
  );
}
