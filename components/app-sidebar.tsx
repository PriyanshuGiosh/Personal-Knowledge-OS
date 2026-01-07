"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Search,
  Tags,
  Settings,
  Brain,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NotesList } from "@/components/notes"
import { TagList } from "@/components/tags"

import { Note } from "@/types/models";

// Menu items for navigation
const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Search",
    url: "/search",
    icon: Search,
  },
  {
    title: "Tags",
    url: "/tags",
    icon: Tags,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

interface AppSidebarProps {
  selectedNoteId?: string | null;
  selectedTags?: string[];
  onNoteSelect: (note: Note) => void;
  onNoteCreate: () => void;
  onTagSelect: (tagId: string) => void;
  onTagDeselect: (tagId: string) => void;
  onClearTags: () => void;
}

export function AppSidebar({
  selectedNoteId,
  selectedTags = [],
  onNoteSelect,
  onNoteCreate,
  onTagSelect,
  onTagDeselect,
  onClearTags
}: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarContent>
        {/* App branding */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Brain
          </SidebarGroupLabel>
        </SidebarGroup>

        {/* Navigation menu */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tags */}
        <SidebarGroup>
          <SidebarGroupLabel>Tags</SidebarGroupLabel>
          <SidebarGroupContent>
            <TagList
              selectedTags={selectedTags}
              onTagSelect={onTagSelect}
              onTagDeselect={onTagDeselect}
              onClearTags={onClearTags}
              className="max-h-48"
            />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Notes list */}
        <SidebarGroup className="flex-1">
          <SidebarGroupLabel>Notes</SidebarGroupLabel>
          <SidebarGroupContent className="h-full">
            <NotesList
              selectedNoteId={selectedNoteId}
              selectedTags={selectedTags}
              onNoteSelect={onNoteSelect}
              onNoteCreate={onNoteCreate}
              className="h-full"
            />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}