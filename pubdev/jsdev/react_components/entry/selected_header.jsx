var React                   = require('react');
var ReactTime               = require('react-time');
var SelectedHeaderOptions   = require('./selected_header_options.jsx');
var AddEntryModal           = require('../modal/add_entry.jsx');
var DeleteEvent             = require('../modal/delete.jsx').DeleteEvent;
var Owner                   = require('../modal/owner.jsx');
var Entities                = require('../modal/entities.jsx');
var History                 = require('../modal/history.jsx');
var SelectedPermission      = require('../components/permission.jsx');
var AutoAffix               = require('react-overlays/lib/AutoAffix.js');
var Affix                   = require('react-overlays/lib/Affix.js');
var Sticky                  = require('react-sticky');
var Button                  = require('react-bootstrap/lib/Button');
var ButtonToolbar           = require('react-bootstrap/lib/ButtonToolbar');
var OverlayTrigger          = require('react-bootstrap/lib/OverlayTrigger');
var Popover                 = require('react-bootstrap/lib/Popover');
var DebounceInput           = require('react-debounce-input');
var SelectedEntry           = require('./selected_entry.jsx');
var Tag                     = require('../components/tag.jsx');
var Source                  = require('../components/source.jsx');
var Crouton                 = require('react-crouton');
var Store                   = require('../activemq/store.jsx');
var AppActions              = require('../flux/actions.jsx');
var Notification            = require('react-notification-system');
var AddFlair                = require('../components/add_flair.jsx');
var Flair                   = require('../modal/flair_modal.jsx');
var ESearch                 = require('../components/esearch.jsx');
var SelectedHeader = React.createClass({
    getInitialState: function() {
        return {
            showEventData:false,
            headerData:'',
            showSource:false,
            sourceData:'',
            tagData:'',
            showTag:false,
            permissionsToolbar:false,
            entitiesToolbar:false,
            historyToolbar:false,
            entryToolbar:false, 
            deleteToolbar:false,
            promoteToolbar:false,
            notificationType:null,
            notificationMessage:null,
            showFlash:false,
            key:this.props.id,
            entityid:null,
            showEntryData:false,
            entryData:'',
            showEntityData:false,
            entityData:'',
            entityid:null,
            flairToolbar:false,        
            refreshing:false,
            loading: false,
        }
    },
    componentDidMount: function() {
        this.setState({loading:true});
        this.sourceRequest = $.get('scot/api/v2/' + this.props.type + '/' + this.props.id + '/source', function(result) {
            var sourceResult = result.records;
            this.setState({showSource:true, sourceData:sourceResult})
            if (this.state.showSource == true && this.state.showEventData == true && this.state.showTag == true && this.state.showEntryData == true && this.state.showEntityData == true) {
                this.setState({loading:false});        
            }        
        }.bind(this));
        this.eventRequest = $.get('scot/api/v2/' + this.props.type + '/' + this.props.id, function(result) {
            var eventResult = result;
            this.setState({showEventData:true, headerData:eventResult})
            if (this.state.showSource == true && this.state.showEventData == true && this.state.showTag == true && this.state.showEntryData == true && this.state.showEntityData == true) {
                this.setState({loading:false});        
            }
        }.bind(this));
        this.tagRequest = $.get('scot/api/v2/' + this.props.type + '/' + this.props.id + '/tag', function(result) {
            var tagResult = result.records;
            this.setState({showTag:true, tagData:tagResult});
            if (this.state.showSource == true && this.state.showEventData == true && this.state.showTag == true && this.state.showEntryData == true && this.state.showEntityData == true) {
                this.setState({loading:false});
            }        
        }.bind(this));
        this.entryRequest = $.get('scot/api/v2/' + this.props.type + '/' + this.props.id + '/entry', function(result) {
            var entryResult = result.records;
            this.setState({showEntryData:true, entryData:entryResult})
            if (this.state.showSource == true && this.state.showEventData == true && this.state.showTag == true && this.state.showEntryData == true && this.state.showEntityData == true) {
                this.setState({loading:false});
            }        
        }.bind(this));
        this.entityRequest = $.get('scot/api/v2/' + this.props.type + '/' + this.props.id + '/entity', function(result) {
            var entityResult = result.records;
            this.setState({showEntityData:true, entityData:entityResult})
            var waitForEntry = {
                waitEntry: function() {
                    if(this.state.showEntryData == false){
                        setTimeout(waitForEntry.waitEntry,50);
                    } else {
                        console.log('entries are done')
                        setTimeout(function(){AddFlair.entityUpdate(entityResult,this.flairToolbarToggle)}.bind(this));
                        if (this.state.showSource == true && this.state.showEventData == true && this.state.showTag == true && this.state.showEntryData == true && this.state.showEntityData == true) {
                            this.setState({loading:false});        
                        }
                    }
                }.bind(this)
            };
            waitForEntry.waitEntry();
        }.bind(this)); 
        console.log('Ran componentDidMount');
        Store.storeKey(this.state.key);
        Store.addChangeListener(this.updated); 
        Store.storeKey('entryNotification')
        Store.addChangeListener(this.notification);
    },
    /*componentWillReceiveProps: function() {
        this.updated();    
    },*/
    updated: function(_type,_message) { 
        this.setState({refreshing:true});
        setTimeout(function(){
            this.sourceRequest = $.get('scot/api/v2/' + this.props.type + '/' + this.props.id + '/source', function(result) {
                var sourceResult = result.records;
                this.setState({showSource:true, sourceData:sourceResult})
                if (this.state.showSource == true && this.state.showEventData == true && this.state.showTag == true && this.state.showEntryData == true && this.state.showEntityData == true) {
                    this.setState({refreshing:false});
                }
            }.bind(this));
            this.eventRequest = $.get('scot/api/v2/' + this.props.type + '/' + this.props.id, function(result) {
                var eventResult = result;
                this.setState({showEventData:true, headerData:eventResult})
                if (this.state.showSource == true && this.state.showEventData == true && this.state.showTag == true && this.state.showEntryData == true && this.state.showEntityData == true) {
                    this.setState({refreshing:false});
                }
            }.bind(this));
            this.tagRequest = $.get('scot/api/v2/' + this.props.type + '/' + this.props.id + '/tag', function(result) {
                var tagResult = result.records;
                this.setState({showTag:true, tagData:tagResult});
                if (this.state.showSource == true && this.state.showEventData == true && this.state.showTag == true && this.state.showEntryData == true && this.state.showEntityData == true) {
                    this.setState({refreshing:false});
                }            
            }.bind(this));
            this.entryRequest = $.get('scot/api/v2/' + this.props.type + '/' + this.props.id + '/entry', function(result) {
                var entryResult = result.records;
                this.setState({showEntryData:true, entryData:entryResult})
                if (this.state.showSource == true && this.state.showEventData == true && this.state.showTag == true && this.state.showEntryData == true && this.state.showEntityData == true) {
                    this.setState({refreshing:false});
                }
            }.bind(this));
            this.entityRequest = $.get('scot/api/v2/' + this.props.type + '/' + this.props.id + '/entity', function(result) {
                var entityResult = result.records;
                this.setState({showEntityData:true, entityData:entityResult})
                var waitForEntry = {
                    waitEntry: function() {
                        if(this.state.showEntryData == false){
                            setTimeout(waitForEntry.waitEntry,50);
                        } else {
                            console.log('entries are done')
                            setTimeout(function(){AddFlair.entityUpdate(entityResult,this.flairToolbarToggle)}.bind(this));
                            if (this.state.showSource == true && this.state.showEventData == true && this.state.showTag == true && this.state.showEntryData == true && this.state.showEntityData == true) {
                                this.setState({refreshing:false});
                            }
                        }
                    }.bind(this)
                };
                waitForEntry.waitEntry();
            }.bind(this));
        }.bind(this),2000)
        if (_type!= undefined && _message != undefined) {
            this.setState({notificationMessage:_message, notificationType:_type, showFlash:true});
        } else {
            this.setState({notificationType:null,notificationMessage:null,showFlash:false}); 
        }
         
        console.log('Ran update')  
    }, 
    notification: function() {
        var notification = this.refs.notificationSystem
        if(activemqwho != "" && notification != undefined && activemqwho != 'api'){
            notification.addNotification({
                message: activemqwho + activemqmessage + activemqid,
                level: 'info',
                autoDismiss: 5,
                action: {
                    label: 'View',
                    callback: function(){
                        window.open('#/' + activemqtype + '/' + activemqid)
                    }
                }
            })
        }
    },
    flairToolbarToggle: function(id){
        if (this.state.flairToolbar == false) {
            this.setState({flairToolbar:true,entityid:id})
        } else {
            this.setState({flairToolbar:false})
        }
    },
    viewedbyfunc: function(headerData) {
        var viewedbyarr = [];
        for (prop in headerData.view_history) {
            viewedbyarr.push(prop);
        };
        return viewedbyarr;
    },
    entryToggle: function() {
        if (this.state.entryToolbar == false) {
            this.setState({entryToolbar:true})
        } else {
            this.setState({entryToolbar:false})
        }
    },
    deleteToggle: function() {
        if (this.state.deleteToolbar == false) {
            this.setState({deleteToolbar:true})
        } else {
            this.setState({deleteToolbar:false})
        } 
    },
    historyToggle: function() {
        if (this.state.historyToolbar == false) {
            this.setState({historyToolbar:true});
        } else {
            this.setState({historyToolbar:false});
        }
    },
    permissionsToggle: function() {
        if (this.state.permissionsToolbar == false) {
            this.setState({permissionsToolbar:true});
        } else {
            this.setState({permissionsToolbar:false});
        }
    },
    entitiesToggle: function() {
        if (this.state.entitiesToolbar == false) {
            this.setState({entitiesToolbar:true});
        } else {
            this.setState({entitiesToolbar:false});
        }
    },
    promoteToggle: function() {
        if (this.state.promoteToolbar == false) {
            this.setState({promoteToolbar:true});
        } else {
            this.setState({promoteToolbar:false});
        }
    },
    titleCase: function(string) {
        var newstring = string.charAt(0).toUpperCase() + string.slice(1)
        return (
            newstring
        )
    },
    render: function() {
        var headerData = this.state.headerData;         
        var viewedby = this.viewedbyfunc(headerData);
        var type = this.props.type;
        var subjectType = this.titleCase(this.props.type);
        var id = this.props.id; 
        var notificationType = this.state.notificationType;
        var notificationMessage = this.state.notificationMessage;
        return (
            <div>
                <div>
                <div id="NewEventInfo" className="entry-header-info-null" style={{width:'100%'}}>
                    <div className='details-subject' style={{display: 'inline-flex',paddingLeft:'5px'}}>
                        {this.state.showEventData ? <EntryDataSubject data={this.state.headerData} subjectType={subjectType} type={type} id={this.props.id} updated={this.updated} />: null}
                        {this.state.refreshing ? <Button bsSize={'xsmall'} bsStyle={'info'}><span>Refreshing Data...</span></Button> :null }
                        {this.state.loading ? <Button bsSize={'xsmall'} bsStyle={'info'}><span>Loading...</span></Button> :null}    
                    </div> 
                    <div className='details-table toolbar'>
                        <table>
                            <tbody>
                                <tr>
                                    <th></th>
                                    <td><div style={{marginLeft:'5px'}}>{this.state.showEventData ? <EntryDataStatus data={this.state.headerData} id={id} type={type} updated={this.updated} />: null}</div></td>
                                    <th>Owner: </th>
                                    <td><span>{this.state.showEventData ? <Owner key={id} data={this.state.headerData.owner} type={type} id={id} updated={this.updated} />: null}</span></td>
                                    <th>Updated: </th>
                                    <td><span id='event_updated' style={{color: 'white',lineHeight: '12pt', fontSize: '12pt', paddingTop:'5px'}} >{this.state.showEventData ? <EntryDataUpdated data={this.state.headerData.updated} /> : null}</span></td>
                                    <th>Tags: </th>
                                    <td>{this.state.showTag ? <Tag data={this.state.tagData} id={id} type={type} updated={this.updated}/> : null}</td>
                                    <th>Source: </th>
                                    <td>{this.state.showSource ? <Source data={this.state.sourceData} id={id} type={type} updated={this.updated} /> : null }</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <Notification ref="notificationSystem" /> 
                
                {this.state.flairToolbar ? <Flair flairToolbarToggle={this.flairToolbarToggle} entityid={this.state.entityid}/> : null}
                   
                {this.state.historyToolbar ? <History historyToggle={this.historyToggle} id={id} type={type} /> : null}
                {this.state.entitiesToolbar ? <Entities entitiesToggle={this.entitiesToggle} entityData={this.state.entityData}/> : null}
                {this.state.permissionsToolbar ? <SelectedPermission updateid={id} id={id} type={type} permissionData={this.state.headerData} permissionsToggle={this.permissionsToggle} updated={this.updated}/> : null}
                {this.state.entryToolbar ? <AddEntryModal title={'Add Entry'} type={type} targetid={id} id={id} addedentry={this.entryToggle} updated={this.updated}/> : null}  
                {this.state.deleteToolbar ? <DeleteEvent subjectType={subjectType} type={type} id={id} deleteToggle={this.deleteToggle} updated={this.updated} /> :null}
                {type != 'alertgroup' ? <SelectedHeaderOptions type={type} subjectType={subjectType} id={id} status={this.state.headerData.status} promoteToggle={this.promoteToggle} permissionsToggle={this.permissionsToggle} entryToggle={this.entryToggle} entitiesToggle={this.entitiesToggle} historyToggle={this.historyToggle} deleteToggle={this.deleteToggle} updated={this.updated} /> :null}
                </div>
                {this.state.showFlash == true ? <Crouton type={this.state.notificationType} id={Date.now()} message={this.state.notificationMessage} /> : null}
                {type != 'alertgroup' ? <SelectedEntry id={id} type={type} entryToggle={this.entryToggle} updated={this.updated} entryData={this.state.entryData} entityData={this.state.entityData} showEntryData={this.state.showEntryData} showEntityData={this.state.showEntityData} /> : null}
            </div>
        )
    }
});

var EntryDataUpdated = React.createClass({
    render: function() {
        data = this.props.data;
        return (
            <div><ReactTime value={data * 1000} format="MM/DD/YY hh:mm:ss a" /></div>
        )
    }
});

var EntryDataStatus = React.createClass({
    getInitialState: function() {
        return {
            buttonStatus:this.props.data.status,
            key: this.props.id
        }
    },
    componentWillReceiveProps: function() {
        this.setState({buttonStatus:this.props.data.status});
    },
    eventStatusToggle: function () {
        if (this.state.buttonStatus == 'open') {
            this.statusAjax('closed');
        } else if (this.state.buttonStatus == 'closed') {
            this.statusAjax('open');
        } 
    },
    statusAjax: function(newStatus) {
        console.log(newStatus);
        var json = {'status':newStatus};
        $.ajax({
            type: 'put',
            url: 'scot/api/v2/' + this.props.type + '/' + this.props.id,
            data: json,
            success: function(data) {
                console.log('success status change to: ' + data);
                AppActions.updateItem(this.state.key,'headerUpdate');    
            }.bind(this),
            error: function() {
                this.props.updated('error','Failed to change status');
            }.bind(this)
        });
    },
    render: function() { 
        var buttonStyle = '';
        var open = '';
        var closed = '';
        var promoted = '';
        if (this.state.buttonStatus == 'open') {
            buttonStyle = 'danger'; 
        } else if (this.state.buttonStatus == 'closed') {
            buttonStyle = 'success';
        } else if (this.state.buttonStatus == 'promoted') {
            buttonStyle = 'warning'
        };
        if (this.props.type == 'alertgroup') {
            open = this.props.data.open_count;
            closed = this.props.data.closed_count;
            promoted = this.props.data.promoted_count;
        }        
        return (
            <div>
                {this.props.type == 'alertgroup' ? <ButtonToolbar><OverlayTrigger trigger='hover' placement='bottom' overlay={<Popover id={this.props.id}>open/closed/promoted alerts</Popover>}><Button bsSize='xsmall'><span className='alertgroup'><span className='alertgroup_open'>{open}</span> / <span className='alertgroup_closed'>{closed}</span> / <span className='alertgroup_promoted'>{promoted}</span></span></Button></OverlayTrigger></ButtonToolbar> : <Button bsStyle={buttonStyle} id="event_status" onClick={this.eventStatusToggle} style={{lineHeight: '12pt', fontSize: '14pt', width: '100%', marginLeft: 'auto'}}>{this.state.buttonStatus}</Button > }
            </div>
        )
    }
});

var EntryDataSubject = React.createClass({
    getInitialState: function() {
        return {value:this.props.data.subject}
    },
    componentWillReceiveProps: function() {
        this.setState({value:this.props.data.subject});
    },
    handleChange: function(event) {
        this.setState({value:event.target.value});
        if (this.state.value != this.props.data.subject) {
            var json = {subject:this.state.value}
            $.ajax({
                type: 'put',
                url: 'scot/api/v2/' + this.props.type + '/' + this.props.id,
                data: json,
                success: function(data) {
                    console.log('success: ' + data);
                    AppActions.updateItem(this.props.id,'headerUpdate'); 
                }.bind(this),
                error: function() { 
                    this.props.updated('error','Failed to update the subject');
                }.bind(this)
            });
        }
    },
    render: function() {
        var subjectLength = this.state.value.length;
        var subjectWidth = subjectLength * 18;
        if (subjectWidth <= 200) {
            subjectWidth = 200;
        }
        return (
            <div>{this.props.subjectType} {this.props.id}: <DebounceInput debounceTimeout={500} forceNotifyOnBlur={true} type='text' value={this.state.value} onChange={this.handleChange} style={{width:subjectWidth+'px'}} /></div>
        )
    }
});

module.exports = SelectedHeader;
