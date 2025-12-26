import PropTypes from 'prop-types';

export default function FormSelect({
    label,
    name,
    value,
    onChange,
    options,
    required = false,
    className = ""
}) {
    return (
        <div className={className}>
            <label className="block mb-2 text-sm font-medium theme-text">
                {label}
            </label>
            <select
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className="theme-input w-full px-3 py-2 rounded-lg text-sm"
            >
                <option value="">Select {label}</option>
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

FormSelect.propTypes = {
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired
    })).isRequired,
    required: PropTypes.bool,
    className: PropTypes.string
};
