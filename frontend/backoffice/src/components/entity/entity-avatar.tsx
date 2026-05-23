import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getDisplayName } from "@/lib/format";

interface EntityAvatarProps {
  image?: string;
  name: string;
  className?: string;
}

export function EntityAvatar({ image, name, className }: EntityAvatarProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Avatar className={className ?? "size-12"}>
      {image ? <AvatarImage src={image} alt={name} /> : null}
      <AvatarFallback>{initials || "—"}</AvatarFallback>
    </Avatar>
  );
}

export function EntityAvatarFromEntity(entity: {
  image?: string;
  company_name?: string;
  contact_name?: string;
  name?: string;
  taxpayer_type_id?: Parameters<typeof getDisplayName>[0]["taxpayer_type_id"];
}) {
  return (
    <EntityAvatar
      image={entity.image}
      name={getDisplayName(entity)}
    />
  );
}
