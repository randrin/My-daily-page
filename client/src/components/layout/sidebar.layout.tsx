"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from "@/components/ui/sidebar";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal
} from "lucide-react";
import { NavApp, NavSettings } from "@/components/nav-app";
import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { useSession } from "next-auth/react";
import { useMe } from "@/hooks/use-profile";
import { showQuerySkeleton } from "@/lib/query-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";

// This is sample data.
const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise"
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup"
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free"
    }
  ],
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#"
        },
        {
          title: "Starred",
          url: "#"
        },
        {
          title: "Settings",
          url: "#"
        }
      ]
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#"
        },
        {
          title: "Explorer",
          url: "#"
        },
        {
          title: "Quantum",
          url: "#"
        }
      ]
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#"
        },
        {
          title: "Get Started",
          url: "#"
        },
        {
          title: "Tutorials",
          url: "#"
        },
        {
          title: "Changelog",
          url: "#"
        }
      ]
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#"
        },
        {
          title: "Team",
          url: "#"
        },
        {
          title: "Billing",
          url: "#"
        },
        {
          title: "Limits",
          url: "#"
        }
      ]
    }
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart
    },
    {
      name: "Travel",
      url: "#",
      icon: Map
    }
  ]
};

const SidebarLayout = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  const { data: session } = useSession();
  const profileQuery = useMe(Boolean(session?.user));
  const profile = profileQuery.data;
  const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || profile?.email || session?.user?.email || "Mon compte";
  const initials = [profile?.firstName?.trim()[0], profile?.lastName?.trim()[0]].filter(Boolean).join("").toLocaleUpperCase("fr") || name.slice(0, 2).toLocaleUpperCase("fr");

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavApp />
        {/* <NavMain items={data.navMain} /> */}
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavSettings />
        {showQuerySkeleton(profileQuery) ? (
          <div className="flex items-center gap-2 px-2 py-2" aria-label="Chargement du profil">
            <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ) : <NavUser user={{ name, email: profile?.email || session?.user?.email || "", initials }} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

export default SidebarLayout;
