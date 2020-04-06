App = {
    web3Provider: null,
    contracts: {},
    sku: 0,
    upc: 0,
    metamaskAccountID: "0x0000000000000000000000000000000000000000",
    originFarmName: null,
    originFarmInformation: null,
    originFarmElevation: 0,
    originFarmLatitude: null,
    originFarmLongitude: null,
    originFarmPickedAt: 0,
    originProductCultivar: null,
    productID: 0,
    productProcessType: 0,
    productNotes: null,
    productScore: null,
    productLotSize: 0,
    productFOBPrice: 0,
    productReceivedAt: 0,
    productRoastedFor: 0,
    productRoastedAt: 0,
    productPrice: 0,
    productBuyPrice: 0,

    init: async function () {
        App.readForm();
        /// Setup access to blockchain
        return await App.initWeb3();
    },

    readForm: function () {
        App.sku = $("#sku").val();
        App.upc = $("#upc").val();
        App.originFarmName = $("#originFarmName").val();
        App.originFarmInformation = $("#originFarmInformation").val();
        App.originFarmElevation = $("#originFarmElevation").val();
        App.originFarmLatitude = $("#originFarmLatitude").val();
        App.originFarmLongitude = $("#originFarmLongitude").val();
        App.originFarmPickedAt = $("#originFarmPickedAt").val();
        App.originProductCultivar = $("#originProductCultivar").val();
        App.productID = $("#productID").val();
        App.productProcessType = $("#productProcessType").val();
        App.productNotes = $("#productNotes").val();
        App.productScore = $("#productScore").val();
        App.productLotSize = $("#productLotSize").val();
        App.productFOBPrice = $("#productFOBPrice").val();
        App.productReceivedAt = $("#productReceivedAt").val();
        App.productRoastedFor = $("#productRoastedFor").val();
        App.productRoastedAt = $("#productRoastedAt").val();
        App.productPrice = $("#productPrice").val();
        App.productBuyPrice = $("#productBuyPrice").val();

        console.log(
            App.sku,
            App.upc,
            App.originFarmName,
            App.originFarmInformation,
            App.originFarmElevation,
            App.originFarmLatitude,
            App.originFarmLongitude,
            App.originFarmPickedAt,
            App.originProductCultivar,
            App.productID,
            App.productProcessType,
            App.productNotes,
            App.productScore,
            App.productLotSize,
            App.productFOBPrice,
            App.productReceivedAt,
            App.productRoastedFor,
            App.productRoastedAt,
            App.productPrice,
            App.productBuyPrice
        );
    },

    initWeb3: async function () {
        /// Find or Inject Web3 Provider
        /// Modern dapp browsers...
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
                // Request account access
                await window.ethereum.enable();
            } catch (error) {
                // User denied account access...
                console.error("User denied account access")
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
        }

        App.getMetaskAccountID();

        return App.initSupplyChain();
    },

    getMetaskAccountID: function () {
        web3 = new Web3(App.web3Provider);

        // Retrieving accounts
        web3.eth.getAccounts(function(err, res) {
            if (err) {
                console.log('Error:',err);
                return;
            }
            console.log('getMetaskID:',res);
            App.metamaskAccountID = res[0];

        })
    },

    initSupplyChain: function () {
        /// Source the truffle compiled smart contracts
        // var jsonSupplyChain='../../build/contracts/SupplyChain.json';
        
        /// JSONfy the smart contracts
        $.getJSON('SupplyChain.json', function(data) {
            console.log('data',data);
            var SupplyChainArtifact = data;
            App.contracts.SupplyChain = TruffleContract(SupplyChainArtifact);
            App.contracts.SupplyChain.setProvider(App.web3Provider);
            
            App.fetchItemBufferOne();
            App.fetchItemBufferTwo();
            App.fetchItemBufferThree();
            App.fetchItemBufferFour();
            App.fetchItemBufferFive();
            App.fetchEvents();
        });

        return App.bindEvents();
    },

    bindEvents: function() {
        $(document).on('click', App.handleButtonClick);
    },

    handleButtonClick: async function(event) {
        event.preventDefault();

        App.getMetaskAccountID();

        var processId = parseInt($(event.target).data('id'));
        console.log('processId',processId);

        switch(processId) {
            case 1:
                return await App.growItem(event);
                break;
            case 2:
                return await App.pickItem(event);
                break;
            case 3:
                return await App.processItem(event);
                break;
            case 4:
                return await App.tasteItem(event);
                break;
            case 5:
                return await App.gradeItem(event);
                break;
            case 6:
                return await App.sellItem(event);
                break;
            case 7:
                return await App.packItem(event);
                break;
            case 8:
                return await App.listItem(event);
                break;
            case 9:
                return await App.buyItem(event);
                break;
            case 10:
                return await App.shipItem(event);
                break;
            case 11:
                return await App.receiveItem(event);
                break;
            case 12:
                return await App.roastItem(event);
                break;
            case 13:
                return await App.offerItem(event);
                break;
            case 14:
                return await App.purchaseItem(event);
                break;
            case 15:
                return await App.fetchItemBufferOne(event);
                break;
            case 16:
                return await App.fetchItemBufferTwo(event);
                break;
            case 17:
                return await App.fetchItemBufferThree(event);
                break;
            case 18:
                return await App.fetchItemBufferFour(event);
                break;
            case 19:
                return await App.fetchItemBufferFive(event);
                break;
        };
    },

    growItem: function(event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        console.log('processId',processId);

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.growItem(
                App.upc,
                App.originFarmName,
                App.originFarmInformation,
                App.originFarmElevation,
                App.originFarmLatitude,
                App.originFarmLongitude,
                App.originProductCultivar,
                {from: App.metamaskAccountID}
            );
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('growItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    pickItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        console.log('processId',processId);

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.pickItem(App.upc, {from: App.metamaskAccountID});
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('pickItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    processItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        console.log('processId',processId);

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.processItem(
                App.upc,
                App.productProcessType,
                {from: App.metamaskAccountID}
            );
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('processItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    tasteItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        console.log('processId',processId);

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.tasteItem(
                App.upc,
                App.productNotes,
                {from: App.metamaskAccountID}
            );
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('tasteItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    gradeItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        console.log('processId',processId);

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.gradeItem(
                App.upc,
                App.productScore,
                {from: App.metamaskAccountID}
            );
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('gradeItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    sellItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        console.log('processId',processId);

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.sellItem(
                App.upc,
                App.productLotSize,
                {from: App.metamaskAccountID}
            );
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('sellItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },
    
    packItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        console.log('processId',processId);

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.packItem(App.upc, {from: App.metamaskAccountID});
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('packItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    listItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        console.log('processId',processId);

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.listItem(App.upc, {from: App.metamaskAccountID});
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('listItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    buyItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        console.log('processId',processId);

        App.contracts.SupplyChain.deployed().then(function(instance) {
            const fobPrice = web3.toWei(App.productFOBPrice, "ether");
            return instance.buyItem(
                App.upc,
                fobPrice,
                {from: App.metamaskAccountID}
            );
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('buyItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    shipItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        console.log('processId',processId);

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.shipItem(App.upc, {from: App.metamaskAccountID});
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('shipItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    receiveItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        console.log('processId',processId);

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.receiveItem(App.upc, {from: App.metamaskAccountID});
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('receiveItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    roastItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        console.log('processId',processId);

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.roastItem(
                App.upc,
                App.productRoastedFor,
                {from: App.metamaskAccountID}
            );
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('roastItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    offerItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        console.log('processId',processId);

        App.contracts.SupplyChain.deployed().then(function(instance) {
            const prodPrice = web3.toWei(App.productPrice, "ether");
            return instance.offerItem(
                App.upc,
                prodPrice,
                {from: App.metamaskAccountID}
            );
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('offerItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    purchaseItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        console.log('processId',processId);

        App.contracts.SupplyChain.deployed().then(function(instance) {
            const buyPrice = web3.toWei(App.productBuyPrice, "ether");
            return instance.purchaseItem(
                App.upc,
                {
                    from: App.metamaskAccountID,
                    value: buyPrice
                }
            );
        }).then(function(result) {
            $("#ftc-item").text(result);
            console.log('purchaseItem',result);
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    fetchItemBufferOne: function () {
        App.upc = $('#upc').val();
        console.log('upc', App.upc);

        App.contracts.SupplyChain.deployed().then(function(instance) {
          return instance.fetchItemBufferOne(App.upc);
        }).then(function(result) {
          $("#ftc-item").text(result);
          console.log('fetchItemBufferOne', result);
        }).catch(function(err) {
          console.log(err.message);
        });
    },

    fetchItemBufferTwo: function () {
        App.contracts.SupplyChain.deployed().then(function(instance) {
          return instance.fetchItemBufferTwo(App.upc);
        }).then(function(result) {
          $("#ftc-item").text(result);
          console.log('fetchItemBufferTwo', result);
        }).catch(function(err) {
          console.log(err.message);
        });
    },

    fetchItemBufferThree: function () {
        App.contracts.SupplyChain.deployed().then(function(instance) {
          return instance.fetchItemBufferThree(App.upc);
        }).then(function(result) {
          $("#ftc-item").text(result);
          console.log('fetchItemBufferThree', result);
        }).catch(function(err) {
          console.log(err.message);
        });
    },

    fetchItemBufferFour: function () {
        App.contracts.SupplyChain.deployed().then(function(instance) {
          return instance.fetchItemBufferFour(App.upc);
        }).then(function(result) {
          $("#ftc-item").text(result);
          console.log('fetchItemBufferFour', result);
        }).catch(function(err) {
          console.log(err.message);
        });
    },

    fetchItemBufferFive: function () {
        App.contracts.SupplyChain.deployed().then(function(instance) {
          return instance.fetchItemBufferFive(App.upc);
        }).then(function(result) {
          $("#ftc-item").text(result);
          console.log('fetchItemBufferFive', result);
        }).catch(function(err) {
          console.log(err.message);
        });
    },

    fetchEvents: function () {
        if (typeof App.contracts.SupplyChain.currentProvider.sendAsync !== "function") {
            App.contracts.SupplyChain.currentProvider.sendAsync = function () {
                return App.contracts.SupplyChain.currentProvider.send.apply(
                App.contracts.SupplyChain.currentProvider,
                    arguments
              );
            };
        }

        App.contracts.SupplyChain.deployed().then(function(instance) {
        var events = instance.allEvents(function(err, log){
          if (!err)
            $("#ftc-events").append('<li>' + log.event + ' - ' + log.transactionHash + '</li>');
        });
        }).catch(function(err) {
          console.log(err.message);
        });
        
    }
};

$(function () {
    $(window).load(function () {
        App.init();
    });
});
