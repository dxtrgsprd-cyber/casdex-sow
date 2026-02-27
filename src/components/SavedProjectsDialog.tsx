import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

interface SavedProjectsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: SavedProject[];
  activeProjectId: string | null;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

const formatProjectName = (project: SavedProject) => {
  const parts = [project.oppNumber, project.customerName, project.projectName].filter(Boolean);
  return parts.length > 0 ? parts.join(' — ') : 'Untitled Project';
};

export default function SavedProjectsDialog({ open, onOpenChange, projects, activeProjectId, onLoad, onDelete, onNew }: SavedProjectsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Saved Projects</DialogTitle>
            <Button size="sm" variant="outline" onClick={() => { onNew(); onOpenChange(false); }}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              New
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {projects.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No saved projects</p>
          )}
          {projects.map((project) => (
            <div
              key={project.id}
              className={`flex items-center justify-between py-3 first:pt-0 last:pb-0 ${
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
                {project.id !== activeProjectId ? (
                  <Button size="sm" variant="ghost" onClick={() => { onLoad(project.id); onOpenChange(false); }}>
                    <FolderOpen className="h-3.5 w-3.5" />
                  </Button>
                ) : (
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
                        This will permanently delete "{formatProjectName(project)}".
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
      </DialogContent>
    </Dialog>
  );
}