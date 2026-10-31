const IconLogo = ({ size = 30 }: { size?: number }) => {
  const dots = [
    [0, 1, 0, 0],
    [1, 1, 1, 1],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="transition-transform group-hover:scale-110"
    >
      {dots.map((row, y) =>
        row.map((active, x) => (
          <circle
            key={`${x}-${y}`}
            cx={15 + x * 23}
            cy={15 + y * 23}
            r="10"
            fill={active ? "#8E9775" : "#E2C799"}
          />
        ))
      )}
    </svg>
  );
};

export default IconLogo;
