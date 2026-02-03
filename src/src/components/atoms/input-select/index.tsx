import React from "react";

interface InputSelectProps {
  options: { value: string; label: string }[]; 
  value: string;
  onChange: (value: string) => void; // Callback for value change
  disabled?: boolean; // Disable the select
}

const InputSelect: React.FC<InputSelectProps> = ({
  options,
  value,
  onChange,
  disabled = false,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={disabled}
      className="px-4 py-2 border border-gray-300 rounded-lg text-black text-sm bg-white focus:outline-none focus:ring-6 focus:ring-gray-300 appearance-none"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default InputSelect;
