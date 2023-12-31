import { NavLink, Outlet } from "react-router-dom";

const Features = () => {
  const menu = [
    {
      id: 1,
      title: "Maintain Tables",
      link: "maintain-tables",
    },
    {
      id: 2,
      title: "Maintain Fast Food",
      link: "maintain-fast-food",
    },
    {
      id: 3,
      title: "Maintain Drinks & Juices",
      link: "maintain-drinks-and-juices",
    },
    {
      id: 4,
      title: "Maintain Vegetables & Rice",
      link: "maintain-vegetables-and-Rice",
    },
    {
      id: 5,
      title: "Maintain Users",
      link: "maintain-users",
    },
    {
      id: 6,
      title: "Maintain Void",
      link: "maintain-void",
    },
    {
      id: 7,
      title: "Sell History",
      link: "sell-history",
    },
    {
      id: 8,
      title: "Expense History",
      link: "expense-history",
    },
    {
      id: 9,
      title: "Maintain Members",
      link: "maintain-members",
    },
  ];

  return (
    <div>
      <div className="min-h-[50px] w-full flex flex-wrap gap-2 items-center justify-center border-b border-blue-200 py-2">
        {menu.map((item) => (
          <NavLink
            to={item.link}
            key={item.id}
            className={({ isActive }) =>
              isActive
                ? "bg-blue-600 border border-blue-600 px-2 rounded-md text-white text-base"
                : "bg-white border border-blue-600 px-2 rounded-md text-blue-600 text-base hover:bg-blue-600 hover:text-white transition-all duration-500"
            }
          >
            {item.title}
          </NavLink>
        ))}
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default Features;
