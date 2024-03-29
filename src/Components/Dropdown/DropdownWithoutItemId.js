import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

const DropdownComponentWithoutId = ({ inputLabelId, name, selectLabelId, selectId, selectedItem, onChange, input, items }) => {
    return (
        <FormControl sx={{ m: 1, width: 300 }}>
            <InputLabel id={inputLabelId}>{name}</InputLabel>
            <Select
                labelId={selectLabelId}
                id={selectId}
                value={selectedItem || 'none'}
                onChange={onChange}
                input={input}
            >
                {items.map(item => (
                    <MenuItem
                        key={item}
                        value={item}
                    >
                        {item}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

export default DropdownComponentWithoutId;