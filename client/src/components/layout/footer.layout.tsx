import { Separator } from "@/components/ui/separator";

const FooterLayout = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex h-16 shrink-0 items-center gap-2 border-t bg-background transition-[width,height] ease-linear">
      <div className="flex w-full items-center justify-between gap-2 px-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <p>© {currentYear} My Daily Page. All rights reserved.</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">
            Privacy
          </a>
          <Separator orientation="vertical" className="h-4" />
          <a href="#" className="hover:text-foreground transition-colors">
            Terms
          </a>
          <Separator orientation="vertical" className="h-4" />
          <a href="#" className="hover:text-foreground transition-colors">
            Support
          </a>
        </div>
      </div>
    </footer>
  );
};

export default FooterLayout;

