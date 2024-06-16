// import components
import { SignInButton } from "../components/buttons";
import { signOut } from "next-auth/react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@nextui-org/react";
import { useSession } from "next-auth/react";

export default function Profile() {
  const { data: session } = useSession();
  const copyProfileLink = () => {
    const user = session.user;
    const email = user.email;
    navigator.clipboard.writeText(`https://readwithmanaland.zzzzion.com/user/${email}`);
  };

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button isIconOnly>
          <SignInButton style={{ borderRadius: "50%" }} />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Static Actions">
        <DropdownItem key="copy" onClick={() => copyProfileLink()}>
          Copy shelf link
        </DropdownItem>
        <DropdownItem
          key="logout"
          className="text-danger"
          color="danger"
          onClick={() => signOut()}>
          Sign out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
