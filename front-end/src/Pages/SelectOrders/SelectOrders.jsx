import { useNavigate, useParams } from "react-router-dom";
import CurrencyFormatter from "../../components/CurrencyFormatter/CurrencyFormatter";
import { useItemsContext } from "../../GlobalContext/ItemsContext";
import HyphenToSpaceConverter from "../../components/HyphenToSpaceConverter/HyphenToSpaceConverter";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useRef, useState } from "react";
import { useCartContext } from "../../GlobalContext/CartContext";
import { MdDelete } from "react-icons/md";
import { MdCancel } from "react-icons/md";
import ReactToPrint from "react-to-print";
import DateFormatter from "../../components/DateFormatter/DateFormatter";
import Swal from "sweetalert2";
import axios from "axios";
import toast from "react-hot-toast";
import { RiLoader2Line } from "react-icons/ri";

const SelectOrders = () => {
  const { name } = useParams();
  let [isOpen, setIsOpen] = useState(false);
  let [isModalOpen, setIsModalOpen] = useState(false);
  let [membership, setMembership] = useState(false);
  let [loading, setLoading] = useState(false);
  let [number, setNumber] = useState("");
  const [tableWiseCart, setTableWiseCart] = useState([]);
  const [memberShipDiscount, setMemberShipDiscount] = useState(null);
  const [availableDiscount, setAvailableDiscount] = useState(false);
  const { drinksAndJuices, fastFood, vegetablesAndRices } = useItemsContext();
  const { handleAddToBill, carts, itemRemove } = useCartContext();
  const componentRef = useRef();
  const navigate = useNavigate();

  //carts items sum calculation
  const totalPrice = carts?.reduce((sum, currentItem) => {
    const itemTotal =
      currentItem.item_price_per_unit * currentItem.item_quantity;
    return sum + itemTotal;
  }, 0);

  const handleMemberShip = () => {
    setNumber(number);
    if (number) {
      setLoading(true);
      axios
        .get(`${import.meta.env.VITE_API_URL}/api/get-members?search=${number}`)
        .then((res) => {
          if (res.data.member.discountValue) {
            setMemberShipDiscount(res.data.member.discountValue);
            setAvailableDiscount(true);
          }
        })
        .catch((err) => {
          if (err) {
            setAvailableDiscount(false);
            setMemberShipDiscount(null);
            setTotalDiscount(0);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const [totalDiscount, setTotalDiscount] = useState(0);

  const handleApply = () => {
    if (availableDiscount && memberShipDiscount) {
      const discount = (totalPrice * memberShipDiscount) / 100;
      setTotalDiscount(discount);
    }
  };

  const handleSingleItemRemove = (item) => {
    if (carts.length === 1) {
      window.location.reload();
    }
    itemRemove(item);
  };

  const totalQuantity =
    tableWiseCart?.length > 0
      ? tableWiseCart.reduce(
          (total, currentItem) => total + currentItem.item_quantity,
          0
        )
      : 0;

  const filterTableData = (name) => {
    if (carts?.length > 0) {
      const data = carts?.filter((item) => item.table_name == name);
      setTableWiseCart(data);
    }
  };

  const handleCart = (item, tableName) => {
    handleAddToBill(item, tableName);
    toast.success(item.item_name + " " + "added");
  };

  //
  // Updated handleCross function
  const handleCross = (item) => {
    const updatedTableWiseCart = tableWiseCart.map((cartItem) => {
      if (cartItem._id === item._id) {
        return { ...cartItem, showDeleteTag: !cartItem.showDeleteTag };
      }
      return cartItem;
    });

    setTableWiseCart(updatedTableWiseCart);
  };

  // handle sell
  const handleSell = (invoiceData, tableName) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Want to sell those items?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#001529",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        const soldItems = {
          table_name: tableName,
          items: invoiceData,
          total_bill: totalPrice,
          total_discount: totalDiscount,
        };
        axios
          .post(
            `${import.meta.env.VITE_API_URL}/api/post-sold-invoices`,
            soldItems
          )
          .then((res) => {
            if (res?.data?.insertedId) {
              Swal.fire({
                title: "Success!",
                html: `Items have been sold<br>ID: ${res.data.insertedId}`,
                icon: "success",
              });
              navigate(`${res.data.insertedId}`);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  };

  useEffect(() => {
    filterTableData(name);
  }, [name, handleAddToBill, itemRemove, carts]);
  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="py-2 px-2 bg-slate-400 text-lg font-semibold rounded-md flex sticky top-6 z-50"
      >
        Check Invoice{" "}
        <p className="ml-2 px-2 bg-blue-300 rounded-full">{totalQuantity}</p>
      </button>
      <h1 className="capitalize font-bold text-center text-2xl mb-4 mt-0 text-[#001529]">
        Order For {name}
      </h1>

      <div className="min-h-screen grid grid-cols-3 gap-2">
        <div className="min-h-screen border border-gray-200 shadow-xl rounded-md">
          <div>
            <h1 className="text-center rounded-md py-2 bg-[#001529] bg-opacity-75 text-white font-bold text-xl">
              Drinks & Juices
            </h1>
          </div>
          {drinksAndJuices &&
            drinksAndJuices?.items?.map((item, index) => (
              <div
                onClick={() => {
                  handleCart(item, name);
                }}
                key={item?._id}
                className="flex justify-between items-center shadow-md mt-4 pb-2 px-2 border-b border-gray-300 cursor-pointer"
              >
                <div className="flex font-bold text-black text-lg">
                  <div>
                    <p className="mr-1">{index + 1}.</p>
                  </div>
                  <div>
                    <p className="wrapped-text">
                      <HyphenToSpaceConverter inputString={item?.item_name} />
                    </p>
                  </div>
                </div>
                <div>
                  <button className="bg-[#001529] hover:bg-opacity-70 px-2 py-1 text-white rounded-md">
                    <CurrencyFormatter value={item?.item_price} />
                  </button>
                </div>
              </div>
            ))}
        </div>
        <div className="min-h-screen border border-gray-200 shadow-xl rounded-md">
          <div>
            <h1 className="text-center rounded-md py-2 bg-[#aa5f34] bg-opacity-75 text-white font-bold text-xl">
              Fast Food
            </h1>
          </div>
          {fastFood &&
            fastFood?.items?.map((item, index) => (
              <div
                onClick={() => {
                  handleCart(item, name);
                }}
                key={item._id}
                className="flex justify-between items-center mt-4 pb-2 shadow-md px-2 border-b border-gray-300 cursor-pointer"
              >
                <div className="flex font-bold text-black text-lg">
                  <div>
                    <p className="mr-1">{index + 1}.</p>
                  </div>
                  <div>
                    <p className="capitalize wrapped-text">
                      <HyphenToSpaceConverter inputString={item?.item_name} />
                    </p>
                  </div>
                </div>
                <div>
                  <button className="bg-[#714226] hover:bg-opacity-70 px-2 py-1 text-white rounded-md">
                    <CurrencyFormatter value={item?.item_price} />
                  </button>
                </div>
              </div>
            ))}
        </div>
        <div className="min-h-screen border border-gray-200 shadow-xl rounded-md">
          <div>
            <h1 className="text-center rounded-md py-2 bg-[#457322] bg-opacity-75 text-white font-bold text-xl">
              Vegetables & Rice
            </h1>
          </div>
          {vegetablesAndRices &&
            vegetablesAndRices?.items?.map((item, index) => (
              <div
                onClick={() => {
                  handleCart(item, name);
                }}
                key={item._id}
                className="flex justify-between items-center mt-4 pb-2 shadow-md px-2 border-b border-gray-300 cursor-pointer"
              >
                <div className="flex font-bold text-black text-lg">
                  <div>
                    <p className="mr-1">{index + 1}.</p>
                  </div>
                  <div>
                    <p className="capitalize wrapped-text">
                      <HyphenToSpaceConverter inputString={item.item_name} />
                    </p>
                  </div>
                </div>
                <div>
                  <button className="bg-[#416622] hover:bg-opacity-70 px-2 py-1 text-white rounded-md">
                    <CurrencyFormatter value={item.item_price} />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
      {/* modal */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsOpen(!isOpen)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-2 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-md bg-white text-left align-middle shadow-xl transition-all relative">
                  <div className="absolute right-0">
                    <MdCancel
                      onClick={() => setIsOpen(!isOpen)}
                      className="h-8 w-8 cursor-pointer"
                    />
                  </div>
                  <div className="p-4 min-h-[400px]">
                    <h1 className="text-center font-bold text-3xl">
                      Food Republic
                    </h1>
                    <h1 className="text-center font-semibold text-2xl mb-4 capitalize">
                      {name}
                    </h1>
                    <div>
                      {tableWiseCart?.length > 0 ? (
                        <div>
                          {tableWiseCart
                            ?.sort((a, b) =>
                              a.item_name.localeCompare(b.item_name)
                            )
                            .map((item, index) => (
                              <div
                                key={item._id}
                                className="min-h-[50px] w-full border-b border-gray-300 shadow-md flex items-center py-2"
                              >
                                <p>{index + 1}.</p>
                                <div className="wrapped-text">
                                  <HyphenToSpaceConverter
                                    inputString={item.item_name}
                                  />
                                </div>
                                <div className="ml-auto mr-4">
                                  <button className="px-2 text-gray-500">
                                    {item.item_quantity} piece
                                  </button>
                                </div>
                                <div className="px-4">
                                  <CurrencyFormatter
                                    value={
                                      item.item_price_per_unit *
                                      item.item_quantity
                                    }
                                  />
                                </div>
                                <div className="">
                                  <MdDelete
                                    onClick={() => handleSingleItemRemove(item)}
                                    className="text-red-700 h-6 w-6 cursor-pointer mx-4"
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div>
                          <h1 className="text-center mt-6">Empty...</h1>
                        </div>
                      )}
                    </div>
                    {tableWiseCart?.length > 0 ? (
                      <div>
                        <div>
                          <h1 className="flex justify-end font-medium text-lg mt-2 mb-2">
                            Total Bill:{" "}
                            <span className="ml-4">
                              <CurrencyFormatter value={totalPrice} />
                            </span>
                          </h1>
                          {availableDiscount ? (
                            <div className="flex justify-end space-x-4">
                              <button>{memberShipDiscount}%</button>
                              <button
                                onClick={handleApply}
                                className="bg-gray-200 px-2 "
                              >
                                Apply
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end">
                              <p className="text-red-600">
                                No Membership found
                              </p>
                            </div>
                          )}
                          {availableDiscount && totalDiscount ? (
                            <div className="flex justify-end mt-2">
                              <h1 className="flex text-lg font-extrabold">
                                After Discount:{" "}
                                <span className="ml-4">
                                  <CurrencyFormatter
                                    value={totalPrice - totalDiscount}
                                  />
                                </span>
                              </h1>
                            </div>
                          ) : null}
                        </div>
                        <div>
                          <p
                            onClick={() => setMembership(!membership)}
                            className="underline cursor-pointer"
                          >
                            Membership offer
                          </p>
                          {membership ? (
                            <div className="flex mt-1">
                              <input
                                type="number"
                                value={number}
                                onChange={(e) => setNumber(e.target.value)}
                                className="h-[20px] w-[140px] border-2 border-gray-300"
                                placeholder="Enter mobile number"
                              />
                              <button
                                onClick={handleMemberShip}
                                className="h-[20px] w-[100px] bg-slate-200 flex items-center justify-center"
                              >
                                Check{" "}
                                {loading ? (
                                  <RiLoader2Line className="h-3 w-3 animate-spin text-black " />
                                ) : null}
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                  {tableWiseCart?.length > 0 ? (
                    <div className="text-center space-x-4 my-4">
                      <button
                        onClick={() => setIsModalOpen(!isModalOpen)}
                        className="h-[40px] w-[130px] bg-blue-500 rounded-md text-white"
                      >
                        Demo Invoice
                      </button>
                      <button
                        onClick={() => handleSell(tableWiseCart, name)}
                        className="h-[40px] w-[130px] bg-purple-800 rounded-md text-white"
                      >
                        Final Invoice
                      </button>
                    </div>
                  ) : null}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      {/* second modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsModalOpen(!isModalOpen)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/75" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-2 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-[310px] transform overflow-hidden rounded-md bg-white text-left align-middle shadow-xl transition-all relative">
                  <div ref={componentRef} className="p-4 min-h-[400px]">
                    <h1 className="text-center font-bold text-xl">
                      Food Republic
                    </h1>
                    <h1 className="text-center font-semibold text-base mb-4 capitalize">
                      {name}
                    </h1>
                    <p className="text-center text-[10px]">
                      <DateFormatter dateString={new Date()} />
                    </p>
                    <div>
                      <div>
                        {tableWiseCart
                          ?.sort((a, b) =>
                            a.item_name.localeCompare(b.item_name)
                          )
                          .map((item, index) => (
                            <div
                              onClick={() => handleCross(item)}
                              key={item._id}
                              className="min-h-[50px] w-full border-b border-gray-300 flex items-center cursor-pointer"
                            >
                              <p className="text-xs">{index + 1}.</p>
                              {item.showDeleteTag ? (
                                <del className="text-xs wrapped-text">
                                  <HyphenToSpaceConverter
                                    inputString={item.item_name}
                                  />
                                </del>
                              ) : (
                                <p className="text-xs wrapped-text">
                                  <HyphenToSpaceConverter
                                    inputString={item.item_name}
                                  />
                                </p>
                              )}
                              <div className="ml-auto mr-2">
                                <button className="px-2 text-gray-500 text-xs">
                                  {item.item_quantity} piece
                                </button>
                              </div>
                              <div className="text-xs text-gray-500">
                                <CurrencyFormatter
                                  value={
                                    item.item_price_per_unit *
                                    item.item_quantity
                                  }
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                      <div className="text-lg font-semibold mt-1">
                        <h1 className="flex justify-end">
                          Total Price:{" "}
                          <span className="ml-2">
                            <CurrencyFormatter value={totalPrice} />
                          </span>
                        </h1>
                      </div>
                    </div>
                  </div>
                  <div className="text-center space-x-4 my-4">
                    <ReactToPrint
                      trigger={() => (
                        <button className="h-[40px] w-[130px] bg-blue-500 rounded-md text-white">
                          Print Demo
                        </button>
                      )}
                      content={() => componentRef.current}
                    />
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default SelectOrders;
