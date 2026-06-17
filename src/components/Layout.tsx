import { useLocation, useNavigate, Link, Outlet } from "react-router-dom";
import { LayoutDashboard, FileText, FolderOpen, Users, ArrowLeftRight } from "lucide-react";
import { useStore } from "@/store";

const navItems = [
  { label: "仪表盘", icon: LayoutDashboard, path: "/" },
  { label: "模板库", icon: FileText, path: "/templates" },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { projects, currentViewRole, switchViewRole, currentUser } = useStore();

  const breadcrumbs = buildBreadcrumbs(location.pathname, projects);

  return (
    <div className="flex h-screen overflow-hidden bg-navy-950">
      <aside className="w-64 flex-shrink-0 bg-navy-900 border-r border-navy-800 flex flex-col">
        <div className="p-5 border-b border-navy-800">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gold-400/10 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-gradient-gold leading-tight">
                DueDiligence
              </h1>
              <p className="text-[10px] text-navy-500 tracking-widest uppercase">
                Collaboration Platform
              </p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
          <p className="px-4 py-2 text-[10px] font-semibold text-navy-500 uppercase tracking-wider">
            导航
          </p>
          {navItems.map((item) => {
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`sidebar-nav-item w-full text-left ${isActive ? "active" : ""}`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-3">
            <p className="px-4 py-2 text-[10px] font-semibold text-navy-500 uppercase tracking-wider">
              项目
            </p>
            {projects.map((project) => {
              const isActive = location.pathname.startsWith(`/project/${project.id}`);
              return (
                <button
                  key={project.id}
                  onClick={() => navigate(`/project/${project.id}`)}
                  className={`sidebar-nav-item w-full text-left ${isActive ? "active" : ""}`}
                >
                  <Users className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{project.name}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-3 border-t border-navy-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gold-400/20 flex items-center justify-center">
              <span className="text-xs font-bold text-gold-400">
                {currentUser.name.slice(0, 1)}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-navy-100 truncate">{currentUser.name}</p>
              <p className="text-[10px] text-navy-500 truncate">{currentUser.email}</p>
            </div>
          </div>

          <button
            onClick={() => switchViewRole(currentViewRole === "investor" ? "target" : "investor")}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-navy-800/50 border border-navy-700/50 hover:border-gold-400/30 hover:bg-navy-800 transition-all duration-200 group"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-navy-400 group-hover:text-gold-400 transition-colors" />
            <div className="flex-1 text-left">
              <p className="text-[10px] text-navy-500">当前视角</p>
              <p className={`text-xs font-semibold ${currentViewRole === "investor" ? "text-gold-400" : "text-blue-400"}`}>
                {currentViewRole === "investor" ? "投资方" : "被调查方"}
              </p>
            </div>
            <div className={`w-2 h-2 rounded-full ${currentViewRole === "investor" ? "bg-gold-400" : "bg-blue-400"}`} />
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-12 flex items-center px-6 border-b border-navy-800 bg-navy-950/80 backdrop-blur-sm flex-shrink-0">
          <nav className="flex items-center text-sm">
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center">
                {index > 0 && <span className="breadcrumb-separator">/</span>}
                {crumb.path ? (
                  <Link
                    to={crumb.path}
                    className="text-navy-400 hover:text-gold-400 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-navy-200 font-medium">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        </header>

        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function buildBreadcrumbs(
  pathname: string,
  projects: { id: string; name: string }[]
): { label: string; path?: string }[] {
  const crumbs: { label: string; path?: string }[] = [{ label: "首页", path: "/" }];

  if (pathname === "/") {
    return [{ label: "仪表盘" }];
  }

  if (pathname === "/templates") {
    crumbs.push({ label: "模板库" });
    return crumbs;
  }

  if (pathname.startsWith("/templates/")) {
    crumbs.push({ label: "模板库", path: "/templates" });
    crumbs.push({ label: "模板详情" });
    return crumbs;
  }

  const projectMatch = pathname.match(/^\/project\/([^/]+)/);
  if (projectMatch) {
    const projectId = projectMatch[1];
    const project = projects.find((p) => p.id === projectId);
    crumbs.push({
      label: project ? project.name : projectId,
      path: `/project/${projectId}`,
    });

    const subPage = pathname.replace(/^\/project\/[^/]+\/?/, "");
    if (subPage) {
      const subMap: Record<string, string> = {
        upload: "资料上传",
        review: "材料审核",
        questions: "问答中心",
        archive: "文件归档",
        security: "安全设置",
      };
      if (subMap[subPage]) {
        crumbs.push({ label: subMap[subPage] });
      }
    }

    return crumbs;
  }

  return crumbs;
}
