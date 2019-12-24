import { SidebarContent } from "./layouts/SidebarContent";
import { Dashboard } from "./views/Dashboard";
import { Library } from "./components/Library";
import { Libraries } from "./views/Libraries";
import { CreateLibrary } from "./components/CreateLibrary";

export const routes: { path: string, layout: React.FC, component: React.FC, exact?: boolean }[] = [
    {
        path: '/',
        layout: SidebarContent,
        component: Dashboard
    },
    {
        path: '/library/:id',
        layout: SidebarContent,
        component: Libraries
    },
    {
        path: '/new-library',
        layout: SidebarContent,
        component: CreateLibrary
    }
]