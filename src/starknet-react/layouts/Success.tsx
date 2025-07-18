export function Success() {
  return (
    <section className="flex flex-col justify-center items-center gap-4 flex-grow">
      <div className="bg-button-secondary rounded-full p-5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="41"
          viewBox="0 0 40 41"
          fill="none"
        >
          <path
            d="M28.7868 15.1583C29.5186 13.9874 29.1627 12.445 27.9918 11.7133C26.821 10.9815 25.2786 11.3374 24.5468 12.5083L17.656 23.5335L13.1668 20.1666C12.0622 19.3382 10.4952 19.562 9.66681 20.6666C8.83839 21.7712 9.06224 23.3382 10.1668 24.1666L16.8335 29.1666C17.3934 29.5865 18.1037 29.7525 18.7917 29.6242C19.4798 29.4959 20.0825 29.0851 20.4535 28.4916L28.7868 15.1583Z"
            fill="#02A17A"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M40 20.5C40 31.5457 31.0457 40.5 20 40.5C8.9543 40.5 0 31.5457 0 20.5C0 9.4543 8.9543 0.5 20 0.5C31.0457 0.5 40 9.4543 40 20.5ZM36.6667 20.5C36.6667 29.7047 29.2047 37.1667 20 37.1667C10.7953 37.1667 3.33333 29.7047 3.33333 20.5C3.33333 11.2953 10.7953 3.83333 20 3.83333C29.2047 3.83333 36.6667 11.2953 36.6667 20.5Z"
            fill="#02A17A"
          />
        </svg>
      </div>

      <h3 className="text-primary text-h4 font-bold">Success!</h3>
    </section>
  )
}
