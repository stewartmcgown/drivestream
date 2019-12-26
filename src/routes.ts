import { SidebarContent } from "./layouts/SidebarContent";
import { Dashboard } from "./views/Dashboard";
import { LibraryView } from "./views/Library";
import { CreateLibrary } from "./components/CreateLibrary";

export const routes: { path: string, layout: React.FC, component: React.FC, exact?: boolean }[] = [
    {
        path: '/',
        layout: SidebarContent,
        component: Dashboard,
        exact: true,
    },
    {
        path: '/library/:id',
        layout: SidebarContent,
        component: LibraryView
    },
    {
        path: '/new-library',
        layout: SidebarContent,
        component: CreateLibrary
    }
]