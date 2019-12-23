import { SidebarContent } from "./layouts/SidebarContent";
import { Dashboard } from "./views/Dashboard";

export const routes: { path: string, layout: React.FC, component: React.FC, exact?: boolean }[] = [
    {
        path: '/',
        layout: SidebarContent,
        component: Dashboard
    }
]