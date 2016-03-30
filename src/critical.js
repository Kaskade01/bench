function Critical(sh,i) {
    this.lethal=false;
    $.extend(this,CRITICAL_DECK[i]);
    this.no=this.name+i;
    sh.criticals.push(this);
    this.isactive=false;
    this.unit=sh;
}

Critical.prototype= {
    toString: function() {
	var a,b,str="";
	var c="";
	if (!this.isactive) return "";
	var n=this.name;
	if (typeof CRIT_translation[this.name].name!="undefined") n=CRIT_translation[this.name].name;
	a="<td><code class='Criticalupg upgrades'></code></td>"; 
	b="<td class='tdstat'>"+n+"</td>";
	n="";
	if (typeof CRIT_translation[this.name].text!="undefined") n=formatstring(CRIT_translation[this.name].text)
	d="<td class='tooltip outoverflow'>"+n+"</td>";
	if (this.unit.team==1)  
	    return "<tr "+c+">"+b+a+d+"</tr>"; 
	else return "<tr "+c+">"+a+b+d+"</tr>";
    },
}
var CRITICAL_DECK=[
    {
	type:"ship",
	count: 2,
	name:"Structural Damage",
	faceup: function() {
	    this.unit.log("Critical: %0",this.name);
	    this.isactive=true;
	    this.unit.wrap_after("getagility",this,function(a) {
		if (a>0) return a-1; else return a;
	    });
	},
	facedown:function() {
	    if (this.isactive) {
		this.unit.getagility.unwrap(this);
		this.unit.log("%0 repaired",this.name);
		this.unit.showstats();
	    }
	    this.isactive=false;
	},
	action: function(n) {
	    var roll=this.unit.rollattackdie(1)[0];
	    if (roll=="hit") {
		this.facedown();
	    } else this.unit.log("%0 not repaired ",this.name);
	    this.unit.endaction(n,"CRITICAL");
	},
    },
    {
	type:"ship",
	name:"Damaged Engine",
	count: 1,
	faceup: function() {
	    this.unit.log("Critical: %0",this.name);
	    this.isactive=true;
	    var save=[];
	    this.unit.wrap_after("getdial",this,function(a) {
		if (save.length==0) {
		    for (var i=0; i<a.length; i++) {
			save[i]={move:a[i].move,difficulty:a[i].difficulty};
			if (a[i].move.match(/TL\d|TR\d/)) save[i].difficulty="RED";
		    }
		}
		return save;
	    });
	},
	facedown: function() {
	    if (this.isactive) this.unit.getdial.unwrap(this);
	    this.isactive=false;
	}
    },
    {
	type:"ship",
	name:"Console Fire",
	count: 2,
	lethal:true,
	faceup: function() {
	    this.unit.log("Critical: %0",this.name);
	    this.isactive=true;
	    this.unit.wrap_before("begincombatphase",this,function() {
		var roll=this.rollattackdie(1)[0];
		if (roll=="hit") {
		    this.log("+1 %HIT% [%0]",this.name);
		    this.resolvehit(1); this.checkdead();
		}
	    });
	},
	action: function(n) {
	    this.facedown();
	    this.unit.endaction(n,"CRITICAL");
	},
	facedown: function() {
	    if (this.isactive) {
		this.unit.log("%0 repaired",this.name);		
		this.unit.begincombatphase.unwrap(this);
	    }
	    this.isactive=false;
	}
    },
    {
	type:"ship",
	count: 2,
	name:"Weapon Malfunction",
	faceup:function() {
	    this.unit.log("Critical: %0",this.name);
	    this.isactive=true;
	    for (var i=0; i<this.unit.weapons.length;i++) 
		if (this.unit.weapons[i].isprimary) break;
	    this.w=i;
	    this.unit.weapons[i].wrap_after("getattack",this,function(a) {
		if (a>0) return a-1; else return a;
	    });	    
	},
	facedown: function() {
	    if (this.isactive) {
		this.unit.weapons[this.w].getattack.unwrap(this);
		this.unit.log("%0 repaired",this.unit.weapons[this.w].name);
		this.isactive=false;
	    }
	},
	action: function(n) {
	    var roll=this.unit.rollattackdie(1)[0];
	    if (roll=="critical"||roll=="hit") this.facedown();
	    else this.unit.log("%0 not repaired",this.name);
	    this.unit.endaction(n,"CRITICAL");
	}
    },
    {
	type:"ship",
	count:2,
	name:"Damaged Sensor Array",
	faceup: function() {
	    this.unit.log("Critical: %0",this.name);
	    this.isactive=true;
	    this.unit.wrap_after("getactionbarlist",this,function() { return [];});
	},
	facedown: function() {
	    if (this.isactive) {
		this.unit.getactionbarlist.unwrap(this);
		this.unit.log("%0 repaired",this.name);
		this.isactive=false;
	    }
	},
	action: function(n) {
	    var roll=this.unit.rollattackdie(1)[0];
	    if (roll=="hit") this.facedown();
	    else this.unit.log("%0 not repaired",this.name);
	    this.unit.endaction(n,"CRITICAL");
	}
    },
    { 
	name:"Minor Explosion",
	count: 2,
	type:"ship",
	lethal:true,
	faceup: function() {
	    this.unit.log("Critical: %0",this.name);
	    var roll=this.unit.rollattackdie(1)[0]
	    this.isactive=false;
	    if (roll=="hit") this.unit.removehull(1); 
	},
	facedown: function() {
	    this.isactive=false;
	}
    },
    {
	name:"Thrust Control Fire",
	count: 2,
	type:"ship",
	faceup: function() {
	    this.unit.log("Critical: %0",this.name);
	    this.unit.addstress();
	    this.isactive=false;
	},
	facedown: function() {
	    this.isactive=false;
	}
    },
    { 
	name:"Direct Hit!",
	count:7,
	type:"ship",
	lethal:true,
	faceup: function() {
	    this.unit.log("Critical: %0",this.name);
	    //this.isactive=false;
	    this.unit.removehull(1);
	},
	facedown: function() {
	    this.isactive=false;
	    this.unit.hull++;
	}
    },
    {
	name:"Munitions Failure",
	count:2,
	type:"ship",
	lethal:true,
	faceup: function() {
	    this.unit.log("Critical: %0",this.name);
	    var m=[];
	    for (i=0; i<this.unit.weapons.length; i++) {
		if (!this.unit.weapons[i].isprimary) m.push(this.unit.weapons[i]);
	    }
	    this.isactive=false;
	    if (m.length==0) return;
	    var w=this.unit.rand(m.length);
	    this.wp=m[w];
	    this.wp.isactive=false;
	    this.unit.log(this.wp.name+" not functioning anymore");
	    this.unit.show();
	},
	facedown: function() { this.isactive=false;
	}
    },
    {
	name:"Minor Hull Breach",
	count:2,
	type:"ship",
	lethal:true,
	faceup: function() {
	    var self=this;
	    this.unit.log("Critical: %0",this.name);
	    this.isactive=true;
	    this.hd=this.unit.handledifficulty;
	    this.unit.wrap_after("handledifficulty",this,function(d) {
		var roll=this.rollattackdie(1)[0];
		if (roll=="hit"&&d=="RED") {
		    this.log("+1 %HIT% [%0]",self.name);
		    this.removehull(1);
		}
	    });
	},
	facedown: function() {
	    if (this.isactive) {
		this.unit.handledifficulty.unwrap(this);
		this.isactive=false;
		this.unit.log("%0 repaired",this.name);
	    }
	}
    },
    { 
	name:"Damaged Cockpit",
	count:2,
	type:"pilot",
	faceup: function() {
	    var self=this;
	    this.unit.log("Critical: %0",this.name);
	    this.isactive=true;
	    this.unit.wrap_before("endround",this,function() {
		this.wrap_after("getagility",self,function() {
		    return 0;
		});
		filltabskill();
		this.showstats();
	    }.bind(this.unit));
	},
	facedown: function() {
	    if (this.isactive) {
		this.isactive=false;
		this.unit.getskill.unwrap(this);
		filltabskill();
		this.unit.showstats();
	    }
	}
    },
    { 
	name:"Blinded Pilot",
	count:2,
	type:"pilot",
	faceup: function() {
	    var self=this;
	    this.unit.log("Critical: %0",this.name);
	    this.isactive=true;
	    this.unit.wrap_after("getattackstrength",this,function(w,t,a) { this.getattackstrength.unwrap(self); self.isactive=false; return 0; });
	},
	facedown: function() {
	    this.isactive=false;
	}
    },
    { 
	name:"Injured Pilot",
	count:2,
	type:"pilot",
	lethal:true,
	faceup: function() {
	    this.unit.log("Critical: %0",this.name);
	    var i;
	    this.isactive=true;
	    for (i=0; i<this.unit.upgrades.length; i++) {
		var upg=this.unit.upgrades[i];
		if (upg.type==ELITE) upg.desactivate();
	    }
	    this.unit.desactivate();
	    this.unit.show();
	},
	facedown: function() {
	    if (this.isactive) {
		var i;
		if (typeof this.unit.init!="undefined") this.unit.init();
		for (i=0; i<this.unit.upgrades.length; i++) {
		    var upg=this.unit.upgrades[i];
		    if (upg.type==ELITE) {
			upg.isactive=true;
			if (typeof upg.init!="undefined") upg.init(this.unit);
		    }
		}
		this.unit.show();
	    }
	    this.isactive=false;
	}
    },
    { 
	name:"Stunned Pilot",
	count:2,
	type:"pilot",
	lethal:true,
	faceup: function() {
	    var self=this;
	    this.unit.log("Critical: %0",this.name);
	    this.isactive=true;
	    this.unit.wrap_before("resolvecollision",this,function() {
		this.log("+1 %HIT% [%0]",self.name);
		this.resolvehit(1);
	    });
	    this.unit.wrap_before("resolveocollision",this,function() {
		this.log("+1 %HIT% [%0]",self.name);
		this.resolvehit(1);
	    });
	},
	facedown: function() {
	    if (this.isactive) {
		this.unit.unwrap("resolvecollision",this);
		this.unit.unwrap("resolveocollision",this);
		this.unit.log("no longer stunned");
	    }
	}
    }
];
