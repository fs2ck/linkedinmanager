import './Avatar.css';

export default function Avatar({
    src,
    alt = 'Avatar',
    size = 'md',
    fallback,
    className = ''
}) {
    const classes = [
        'avatar',
        `avatar-${size}`,
        className
    ].filter(Boolean).join(' ');

    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className={classes}>
            {src ? (
                <img src={src} alt={alt} className="avatar-image" />
            ) : (
                <span className="avatar-fallback">
                    {fallback || getInitials(alt)}
                </span>
            )}
        </div>
    );
}
