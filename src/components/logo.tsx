
import { cn } from "@/lib/utils";
import Image from 'next/image';

const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src="https://ik.imagekit.io/rgazxzsxr/68c4095c2a95d.png?updatedAt=1761819080151"
        alt="BranchWise Logo"
        width={80}
        height={80}
        data-ai-hint="medical council logo"
        unoptimized
      />
    </div>
  );
};

export default Logo;
