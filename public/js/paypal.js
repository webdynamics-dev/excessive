/* eslint-disable*/

paypal
  .Buttons({
    // Order is created on the server and the order id is returned
    createOrder: (data, actions) => {
      return fetch('/api/orders', {
        method: 'post',
        // use the "body" param to optionally pass additional order information
        // like product ids or amount
        headers: {
          'Content-Type': 'application/json',
        },
        // use the "body" param to optionally pass additional order information
        // like product skus and quantities
        body: JSON.stringify({
          //   custom_id: window.crypto.randomUUID(),
          value: `${
            document.getElementById('total-cost').innerHTML.split('€')[1]
          }`,
        }),
      })
        .then((response) => response.json())
        .then((order) => order.id);
    },
    // Finalize the transaction on the server after payer approval
    onApprove: async (data, actions) => {
      return fetch(`/api/orders/${data.orderID}/capture`, {
        method: 'post',
      })
        .then((response) => response.json())
        .then(async (orderData) => {
          // !Successful capture! For dev/demo purposes:
          // console.log(
          //   'Capture result',
          //   orderData,
          //   JSON.stringify(orderData, null, 2)
          // );
          // !===========================
          //   const transaction = orderData.purchase_units[0].payments.captures[0];
          //   alert(
          //     `Transaction ${transaction.status}: ${transaction.id}\n\nSee console for all available details`
          //   );

          //* FILL IN ORDER ITEM DETAILS
          const checkboxes = document.querySelectorAll('.cart__checkbox');

          let i = 0;
          let items = [];

          for (let checkbox of checkboxes) {
            if (checkbox.checked) {
              items.push({
                productId: checkbox.dataset.checkId,
                productVersion: checkbox.dataset.checkVersion,
                amount: localStorage.getItem(`CI-${checkbox.dataset.checkId}`),
                unitPrice: document
                  .getElementById(`${checkbox.dataset.checkId}-price`)
                  .innerHTML.split(' ')[1],
              });
            }
          }

          // * ORDER DETAILS

          const name = document.querySelector('input[type = "name"]');
          const address = document.querySelector('input[type = "address"]');
          const zipCode = document.querySelector('input[type = "zipcode"]');
          const city = document.querySelector('input[type = "city"]');
          const country = document.querySelector('input[type = "country"]');
          const telephone = document.querySelector('input[type = "telephone"]');

          // * ===========================

          const data = {
            items: items,
            name: name.value,
            address: address.value,
            zipcode: zipCode.value,
            city: city.value,
            country: country.value,
            telephone: telephone.value,
            paypalResult: orderData.status,
            paypalTransactionId: orderData.id,
            paypalAmount:
              orderData.purchase_units[0].payments.captures[0].amount.value,
            paypalCurrency:
              orderData.purchase_units[0].payments.captures[0].amount
                .currency_code,
            paypalFee:
              orderData.purchase_units[0].payments.captures[0]
                .seller_receivable_breakdown.paypal_fee.value,
            paypalNetAmount:
              orderData.purchase_units[0].payments.captures[0]
                .seller_receivable_breakdown.net_amount.value,
            paypalLinks: orderData.purchase_units[0].payments.captures[0].links,
            paypalPayerId: orderData.payment_source.paypal.account_id,
          };

          if (orderData.status === 'COMPLETED') {
            const result = await fetch('/api/v1/orders/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            })
              .then((result) => result.json())
              .then((data) => {
                if (data.status === 'success') {
                  // * CLEAR ORDERED ITEMS FROM CART

                  for (let checkbox of checkboxes) {
                    if (checkbox.checked) {
                      localStorage.removeItem(`CI-${checkbox.dataset.checkId}`);
                    }
                  }

                  // * ========================

                  console.log(data);
                  window.location.assign(
                    `/order-result/success/${data.order.id}`
                  ); //! da se vidi dali ke se prepravi preku router
                } else if (
                  data.status === 'fail' ||
                  data.order.transactionFlag === 'FLAGGED TRANSACTION'
                ) {
                  window.location.assign(`/order-result/failed/failed`);
                } else {
                  window.location.assign(`/order-result/failed/failed`);
                }
              });
          }
          //   console.log(`paypal transID: ${orderData.id},
          //   trans result: ${orderData.status},
          //   from account ID: ${orderData.payment_source.paypal.account_id},
          //   amount: ${orderData.purchase_units[0].payments.captures[0].amount.value} ${orderData.purchase_units[0].payments.captures[0].amount.currency_code},
          //   paypal fee: ${orderData.purchase_units[0].payments.captures[0].seller_receivable_breakdown.paypal_fee.value},
          //   net amount: ${orderData.purchase_units[0].payments.captures[0].seller_receivable_breakdown.net_amount.value},
          //   links: ${orderData.purchase_units[0].payments.captures[0].links}`);
          // When ready to go live, remove the alert and show a success message within this page. For example:
          // const element = document.getElementById('paypal-button-container');
          // element.innerHTML = '<h3>Thank you for your payment!</h3>';
          // Or go to another URL:  actions.redirect('thank_you.html');
        });
    },
  })
  .render('#paypal-button-container');
