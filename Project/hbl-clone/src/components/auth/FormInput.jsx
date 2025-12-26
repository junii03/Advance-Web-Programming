import PropTypes from 'prop-types';

export default function FormInput({
    label,
    type = "text",
    name,
    value,
    onChange,
    placeholder,
    required = false,
    minLength,
    className = ""
}) {
    return (
        <div className={className}>
            <label className="block mb-2 text-sm font-medium theme-text">
                {label}
            </label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                minLength={minLength}
                className="theme-input w-full px-3 py-2 rounded-lg text-sm"
            />
        </div>
    );
}

FormInput.propTypes = {
    label: PropTypes.string.isRequired,
    type: PropTypes.string,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    minLength: PropTypes.number,
    className: PropTypes.string
};
