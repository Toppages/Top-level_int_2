import { motion } from "framer-motion";
import { NavLink } from "@mantine/core";

interface NavLinkItemProps {
  index: number;
  active: number;
  label: string;
  icon: React.ComponentType<any>;
  onClick: () => void;
  disabled?: boolean;
}

function NavLinkItem({ index, active, label, icon: Icon, onClick, disabled = false }: NavLinkItemProps) {
  return (
    <motion.div
      key={`${label}-${index}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
    >
      <NavLink
        variant="subtle"
        color="indigo"
        active={index === active}
        label={label}
        icon={<Icon size={20} stroke={1.5} />}
        disabled={disabled}
        onClick={onClick}
        style={{
          padding: "10px 15px",
          borderRadius: "8px",
          marginBottom: "8px",
          backgroundColor: index === active ? "#0c2a85" : "transparent",
          color: index === active ? "white" : "#0c2a85",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          transition: "background-color 0.3s ease, color 0.3s ease",
        }}
        onMouseEnter={(e: { currentTarget: { style: { backgroundColor: string; color: string; }; }; }) => {
          if (!disabled && index !== active) {
            e.currentTarget.style.backgroundColor = "#dbe4f3";
            e.currentTarget.style.color = "#0c2a85";
          }
        }}
        onMouseLeave={(e: { currentTarget: { style: { backgroundColor: string; color: string; }; }; }) => {
          if (!disabled && index !== active) {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#0c2a85";
          }
        }}
      />
    </motion.div>
  );
}

export default NavLinkItem;